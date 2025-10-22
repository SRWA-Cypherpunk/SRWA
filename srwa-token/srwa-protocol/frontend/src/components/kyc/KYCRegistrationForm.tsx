import { useState } from 'react';
import { useUserRegistry } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KYCFormData {
  // Informações Pessoais
  fullName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;

  // Informações Financeiras
  monthlyIncome: string;
  sourceOfIncome: string;
  occupation: string;
  employer: string;

  // Documentos
  documentType: string;
  documentNumber: string;
  documentFile?: File;
  proofOfAddressFile?: File;
}

const COUNTRIES = [
  'Brasil',
  'Estados Unidos',
  'Canadá',
  'Reino Unido',
  'Portugal',
  'Outro',
];

const INCOME_RANGES = [
  'Até R$ 2.000',
  'R$ 2.000 - R$ 5.000',
  'R$ 5.000 - R$ 10.000',
  'R$ 10.000 - R$ 20.000',
  'R$ 20.000 - R$ 50.000',
  'Acima de R$ 50.000',
];

const DOCUMENT_TYPES = ['RG', 'CPF', 'CNH', 'Passaporte'];

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
      // Chamar o smart contract para marcar KYC como completo
      const result = await completeKYC();

      toast.success('KYC registrado com sucesso!', {
        description: 'Suas informações foram enviadas e seu KYC está ativo.',
      });

      console.log('KYC completion transaction:', result.signature);

      onComplete();
    } catch (error: any) {
      console.error('Erro ao registrar KYC:', error);
      toast.error('Erro ao registrar KYC', {
        description: error.message || 'Tente novamente',
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Registro KYC</h2>
        <p className="text-muted-foreground">
          Complete seu cadastro para participar de ofertas de tokens
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Informações Pessoais'}
            {currentStep === 2 && 'Informações Financeiras'}
            {currentStep === 3 && 'Documentação'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Preencha seus dados pessoais (todos os campos são opcionais)'}
            {currentStep === 2 && 'Informe seus dados financeiros (todos os campos são opcionais)'}
            {currentStep === 3 && 'Envie seus documentos de identificação (opcional)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Informações Pessoais */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => updateField('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o país" />
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
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      placeholder="Estado"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, complemento"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">CEP</Label>
                  <Input
                    id="postalCode"
                    placeholder="00000-000"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Informações Financeiras */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Renda Mensal</Label>
                  <Select
                    value={formData.monthlyIncome}
                    onValueChange={(value) => updateField('monthlyIncome', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa de renda" />
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
                  <Label htmlFor="sourceOfIncome">Origem da Renda</Label>
                  <Input
                    id="sourceOfIncome"
                    placeholder="Ex: Salário, Investimentos, Negócio Próprio"
                    value={formData.sourceOfIncome}
                    onChange={(e) => updateField('sourceOfIncome', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Profissão</Label>
                  <Input
                    id="occupation"
                    placeholder="Sua profissão"
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer">Empregador</Label>
                  <Input
                    id="employer"
                    placeholder="Nome da empresa"
                    value={formData.employer}
                    onChange={(e) => updateField('employer', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 3: Documentação */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value) => updateField('documentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
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
                    <Label htmlFor="documentNumber">Número do Documento</Label>
                    <Input
                      id="documentNumber"
                      placeholder="000.000.000-00"
                      value={formData.documentNumber}
                      onChange={(e) => updateField('documentNumber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Document File Upload */}
                <div className="space-y-2">
                  <Label>Documento de Identidade</Label>
                  {!formData.documentFile ? (
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arraste seu documento ou clique para selecionar
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
                          <span>Selecionar arquivo</span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <span className="text-sm">{formData.documentFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('documentFile')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Proof of Address Upload */}
                <div className="space-y-2">
                  <Label>Comprovante de Residência</Label>
                  {!formData.proofOfAddressFile ? (
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arraste seu comprovante ou clique para selecionar
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
                          <span>Selecionar arquivo</span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <span className="text-sm">{formData.proofOfAddressFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('proofOfAddressFile')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                Voltar
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Finalizar KYC'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Todos os campos são opcionais. Quanto mais informações você
          fornecer, maior será seu nível de verificação e acesso a diferentes tipos de ofertas.
        </p>
      </div>
    </div>
  );
}
