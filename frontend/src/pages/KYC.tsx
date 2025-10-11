import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Upload, FileText, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type KYCStatus = "not-started" | "in-progress" | "under-review" | "approved" | "rejected";

export default function KYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<KYCStatus>("not-started");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    entityType: "",
    companyName: "",
    taxId: "",
  });

  const steps = [
    { id: 1, title: "Personal Information", icon: FileText },
    { id: 2, title: "Entity Details", icon: Shield },
    { id: 3, title: "Documentation", icon: Upload },
    { id: 4, title: "Review", icon: CheckCircle },
  ];

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Approved</Badge>;
      case "under-review":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Under Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>;
      case "in-progress":
        return <Badge className="bg-brand-500/10 text-brand-400 border-brand-500/20">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const handleSubmit = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setKycStatus("in-progress");
    } else {
      setKycStatus("under-review");
      toast({
        title: "KYC Application Submitted",
        description: "Your application is now under review. We'll notify you once complete.",
      });
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-h1 font-semibold text-fg-primary">KYC Verification</h1>
            {getStatusBadge(kycStatus)}
          </div>
          <p className="text-sm sm:text-body-1 text-fg-secondary">
            Complete your Know Your Customer verification to access institutional RWA markets.
          </p>
        </div>

        {/* Progress */}
        <Card className="card-institutional animate-slide-up">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-h3 font-medium text-fg-primary">Verification Progress</h2>
              <span className="text-sm sm:text-body-2 text-fg-muted">{currentStep}/4 Complete</span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className={`flex flex-col items-center space-y-2 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-brand-500/10 border border-brand-500/20" :
                    isCompleted ? "bg-green-500/10 border border-green-500/20" :
                    "bg-bg-elev-2 border border-stroke-line"
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      isActive ? "bg-brand-500/20" :
                      isCompleted ? "bg-green-500/20" :
                      "bg-fg-muted/10"
                    }`}>
                      <StepIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isActive ? "text-brand-400" :
                        isCompleted ? "text-green-400" :
                        "text-fg-muted"
                      }`} />
                    </div>
                    <span className={`text-xs sm:text-micro text-center font-medium ${
                      isActive ? "text-brand-400" :
                      isCompleted ? "text-green-400" :
                      "text-fg-muted"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Form Steps */}
        <Card className="card-institutional animate-fade-in">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl lg:text-h2 font-semibold text-fg-primary">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger className="input-institutional">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="ch">Switzerland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl lg:text-h2 font-semibold text-fg-primary">Entity Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, entityType: value }))}>
                    <SelectTrigger className="input-institutional">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="fund">Investment Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                    className="input-institutional"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl lg:text-h2 font-semibold text-fg-primary">Documentation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-bg-elev-2 border-stroke-line p-4 sm:p-6 hover-lift cursor-pointer">
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                    <div>
                      <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary">Government ID</h4>
                      <p className="text-xs sm:text-body-2 text-fg-muted">Upload passport or driver's license</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">Choose File</Button>
                  </div>
                </Card>
                
                <Card className="bg-bg-elev-2 border-stroke-line p-4 sm:p-6 hover-lift cursor-pointer">
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                    <div>
                      <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary">Proof of Address</h4>
                      <p className="text-xs sm:text-body-2 text-fg-muted">Utility bill or bank statement</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">Choose File</Button>
                  </div>
                </Card>
                
                <Card className="bg-bg-elev-2 border-stroke-line p-4 sm:p-6 hover-lift cursor-pointer">
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                    <div>
                      <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary">Articles of Incorporation</h4>
                      <p className="text-xs sm:text-body-2 text-fg-muted">Official company formation documents</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">Choose File</Button>
                  </div>
                </Card>
                
                <Card className="bg-bg-elev-2 border-stroke-line p-4 sm:p-6 hover-lift cursor-pointer">
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                    <div>
                      <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary">Beneficial Ownership</h4>
                      <p className="text-xs sm:text-body-2 text-fg-muted">UBO declaration form</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">Choose File</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl lg:text-h2 font-semibold text-fg-primary">Review & Submit</h3>
              <div className="space-y-4">
                <Card className="bg-bg-elev-2 border-stroke-line p-4">
                  <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-body-2">
                    <div>Name: {formData.firstName} {formData.lastName}</div>
                    <div>Email: {formData.email}</div>
                    <div>Phone: {formData.phone}</div>
                    <div>Country: {formData.country}</div>
                  </div>
                </Card>
                
                <Card className="bg-bg-elev-2 border-stroke-line p-4">
                  <h4 className="text-sm sm:text-body-1 font-medium text-fg-primary mb-3">Entity Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-body-2">
                    <div>Type: {formData.entityType}</div>
                    <div>Company: {formData.companyName}</div>
                    <div>Tax ID: {formData.taxId}</div>
                  </div>
                </Card>
                
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-brand-400 mt-0.5" />
                    <div className="text-xs sm:text-body-2 text-brand-400">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>By submitting this application, you confirm that all information provided is accurate and complete. Processing typically takes 2-5 business days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <Button onClick={handleSubmit} className="btn-primary w-full sm:w-auto">
              {currentStep === 4 ? "Submit Application" : "Continue"}
            </Button>
          </div>
        </Card>

        {/* Status Cards */}
        {kycStatus !== "not-started" && (
          <Card className="card-institutional animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                {kycStatus === "approved" && <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />}
                {kycStatus === "under-review" && <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />}
                {kycStatus === "rejected" && <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />}
                {kycStatus === "in-progress" && <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg sm:text-h3 font-medium text-fg-primary">
                  {kycStatus === "approved" && "Verification Complete"}
                  {kycStatus === "under-review" && "Under Review"}
                  {kycStatus === "rejected" && "Verification Rejected"}
                  {kycStatus === "in-progress" && "Application In Progress"}
                </h3>
                <p className="text-sm sm:text-body-2 text-fg-muted">
                  {kycStatus === "approved" && "You now have access to all institutional RWA markets."}
                  {kycStatus === "under-review" && "We're reviewing your application. We'll notify you once complete."}
                  {kycStatus === "rejected" && "Please review the feedback and resubmit your application."}
                  {kycStatus === "in-progress" && "Complete all steps to submit your verification application."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}