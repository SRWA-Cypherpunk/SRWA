import { useState } from 'react';
import { useUserRegistry } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Upload, X, User, DollarSign, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KYCFormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;

  // Financial Information
  monthlyIncome: string;
  sourceOfIncome: string;
  occupation: string;
  employer: string;

  // Documents
  documentType: string;
  documentNumber: string;
  documentFile?: File;
  proofOfAddressFile?: File;
}

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Brazil',
  'Portugal',
  'Other',
];

const INCOME_RANGES = [
  'Up to $2,000',
  '$2,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $20,000',
  '$20,000 - $50,000',
  'Above $50,000',
];

const DOCUMENT_TYPES = ['Passport', 'Driver License', 'National ID', 'Tax ID'];

export function KYCRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const { userRegistry, completeKYC } = useUserRegistry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    monthlyIncome: '',
    sourceOfIncome: '',
    occupation: '',
    employer: '',
    documentType: '',
    documentNumber: '',
  });

  const updateField = (field: keyof KYCFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'documentFile' | 'proofOfAddressFile', file: File) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const removeFile = (field: 'documentFile' | 'proofOfAddressFile') => {
    setFormData((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await completeKYC();

      toast.success('KYC registered successfully!', {
        description: 'Your information has been submitted and your KYC is active.',
      });

      console.log('KYC completion transaction:', result.signature);

      onComplete();
    } catch (error: any) {
      console.error('Error registering KYC:', error);
      toast.error('Error registering KYC', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Financial Info', icon: DollarSign },
    { number: 3, title: 'Documents', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header with gradient */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
          KYC Registration
        </h2>
        <p className="text-muted-foreground text-lg">
          Complete your registration to participate in token offerings
        </p>
      </motion.div>

      {/* Enhanced Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" style={{ zIndex: 0 }} />
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-orange-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ zIndex: 1 }}
          />

          {steps.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const Icon = step.icon;

            return (
              <div key={step.number} className="flex flex-col items-center relative" style={{ zIndex: 2 }}>
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-500/50'
                      : isActive
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
                <motion.p
                  className={`mt-2 text-sm font-medium ${
                    isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {step.title}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentStep === 1 && 'Personal Information'}
                {currentStep === 2 && 'Financial Information'}
                {currentStep === 3 && 'Documentation'}
              </CardTitle>
              <CardDescription className="text-base">
                {currentStep === 1 && 'Fill in your personal details (all fields are optional)'}
                {currentStep === 2 && 'Provide your financial information (all fields are optional)'}
                {currentStep === 3 && 'Upload your identification documents (optional)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => updateField('country', value)}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10 focus:border-purple-500/50">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className="bg-black/20 border-white/10 focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Street, number, complement"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="00000-000"
                        value={formData.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Financial Information */}
                {currentStep === 2 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income</Label>
                      <Select
                        value={formData.monthlyIncome}
                        onValueChange={(value) => updateField('monthlyIncome', value)}
                      >
                        <SelectTrigger className="bg-black/20 border-white/10 focus:border-purple-500/50">
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sourceOfIncome">Source of Income</Label>
                      <Input
                        id="sourceOfIncome"
                        placeholder="E.g., Salary, Investments, Business"
                        value={formData.sourceOfIncome}
                        onChange={(e) => updateField('sourceOfIncome', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="Your profession"
                        value={formData.occupation}
                        onChange={(e) => updateField('occupation', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        placeholder="Company name"
                        value={formData.employer}
                        onChange={(e) => updateField('employer', e.target.value)}
                        className="bg-black/20 border-white/10 focus:border-purple-500/50"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Documentation */}
                {currentStep === 3 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentType">Document Type</Label>
                        <Select
                          value={formData.documentType}
                          onValueChange={(value) => updateField('documentType', value)}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10 focus:border-purple-500/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentNumber">Document Number</Label>
                        <Input
                          id="documentNumber"
                          placeholder="000-000-000"
                          value={formData.documentNumber}
                          onChange={(e) => updateField('documentNumber', e.target.value)}
                          className="bg-black/20 border-white/10 focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    {/* Document File Upload */}
                    <div className="space-y-2">
                      <Label>Identity Document</Label>
                      {!formData.documentFile ? (
                        <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all duration-300 bg-black/20">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag your document here or click to select
                          </p>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('documentFile', file);
                            }}
                            className="hidden"
                            id="documentFile"
                          />
                          <label htmlFor="documentFile">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>Select File</span>
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <motion.div
                          className="flex items-center justify-between border border-white/10 rounded-lg p-4 bg-black/20"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <span className="text-sm">{formData.documentFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile('documentFile')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Proof of Address Upload */}
                    <div className="space-y-2">
                      <Label>Proof of Address</Label>
                      {!formData.proofOfAddressFile ? (
                        <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all duration-300 bg-black/20">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag your proof of address here or click to select
                          </p>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('proofOfAddressFile', file);
                            }}
                            className="hidden"
                            id="proofOfAddressFile"
                          />
                          <label htmlFor="proofOfAddressFile">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>Select File</span>
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <motion.div
                          className="flex items-center justify-between border border-white/10 rounded-lg p-4 bg-black/20"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <span className="text-sm">{formData.proofOfAddressFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile('proofOfAddressFile')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="min-w-[120px]"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="min-w-[120px] bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="min-w-[120px] bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete KYC
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Note:</strong> All fields are optional. The more
          information you provide, the higher your verification level and access to different types
          of offerings.
        </p>
      </motion.div>
    </div>
  );
}
