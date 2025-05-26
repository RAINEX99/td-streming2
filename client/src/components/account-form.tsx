import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Plus } from "lucide-react";
import type { StreamingAccount } from "@shared/schema";

interface AccountFormProps {
  account?: StreamingAccount | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    accountPassword: "",
    accountType: "",
    profileNumber: "",
    platform: "",
    deliveryDate: "",
    durationValue: "",
    durationUnit: "months",
    expirationDate: "",
    replaced: "no",
    replacementReason: "",
  });

  const [showProfileNumber, setShowProfileNumber] = useState(false);
  const [showReplacementReason, setShowReplacementReason] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        clientName: account.clientName,
        clientEmail: "",
        clientPhone: "",
        accountPassword: "",
        accountType: account.accountType,
        profileNumber: "",
        platform: account.platform,
        deliveryDate: account.deliveryDate,
        durationValue: "",
        durationUnit: "months",
        expirationDate: account.expirationDate,
        replaced: "no",
        replacementReason: "",
      });
    }
  }, [account]);

  useEffect(() => {
    setShowProfileNumber(formData.accountType === "Perfil");
  }, [formData.accountType]);

  useEffect(() => {
    setShowReplacementReason(formData.replaced === "yes");
  }, [formData.replaced]);

  useEffect(() => {
    if (formData.deliveryDate && formData.durationValue && formData.durationUnit) {
      const deliveryDate = new Date(formData.deliveryDate);
      const duration = parseInt(formData.durationValue);
      
      if (!isNaN(duration)) {
        let expirationDate = new Date(deliveryDate);
        
        switch (formData.durationUnit) {
          case "days":
            expirationDate.setDate(expirationDate.getDate() + duration);
            break;
          case "weeks":
            expirationDate.setDate(expirationDate.getDate() + (duration * 7));
            break;
          case "months":
            expirationDate.setMonth(expirationDate.getMonth() + duration);
            break;
          case "years":
            expirationDate.setFullYear(expirationDate.getFullYear() + duration);
            break;
        }
        
        setFormData(prev => ({
          ...prev,
          expirationDate: expirationDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.deliveryDate, formData.durationValue, formData.durationUnit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      clientName: formData.clientName,
      platform: formData.platform,
      accountType: formData.accountType,
      deliveryDate: formData.deliveryDate,
      expirationDate: formData.expirationDate,
      credentials: {
        email: formData.clientEmail,
        phone: formData.clientPhone,
        password: formData.accountPassword,
        profileNumber: formData.profileNumber
      },
      notes: formData.replacementReason,
      status: "active"
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="client-name" className="block text-sm font-medium mb-1">Nombre del Cliente *</Label>
          <Input
            id="client-name"
            type="text"
            required
            value={formData.clientName}
            onChange={(e) => handleInputChange("clientName", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="client-email" className="block text-sm font-medium mb-1">Correo Electrónico</Label>
          <Input
            id="client-email"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange("clientEmail", e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="client-phone" className="block text-sm font-medium mb-1">Número de Teléfono (opcional)</Label>
          <Input
            id="client-phone"
            type="tel"
            placeholder="+52 123 456 7890"
            value={formData.clientPhone}
            onChange={(e) => handleInputChange("clientPhone", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="account-password" className="block text-sm font-medium mb-1">Contraseña (opcional)</Label>
          <Input
            id="account-password"
            type="text"
            value={formData.accountPassword}
            onChange={(e) => handleInputChange("accountPassword", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="account-type" className="block text-sm font-medium mb-1">Tipo de Cuenta *</Label>
          <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perfil">Perfil compartido</SelectItem>
              <SelectItem value="Cuenta completa">Cuenta completa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showProfileNumber && (
          <div>
            <Label htmlFor="profile-number" className="block text-sm font-medium mb-1">Número de Perfil Asignado *</Label>
            <Input
              id="profile-number"
              type="number"
              min="1"
              value={formData.profileNumber}
              onChange={(e) => handleInputChange("profileNumber", e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="platform" className="block text-sm font-medium mb-1">Plataforma *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              {formData.platform && !["Netflix", "Disney+", "HBO Max", "Amazon Prime", "Spotify"].includes(formData.platform) ? (
                <Input
                  value={formData.platform}
                  onChange={(e) => handleInputChange("platform", e.target.value)}
                  placeholder="Plataforma personalizada"
                  className="w-full"
                />
              ) : (
                <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Netflix">Netflix</SelectItem>
                    <SelectItem value="Disney+">Disney+</SelectItem>
                    <SelectItem value="HBO Max">HBO Max</SelectItem>
                    <SelectItem value="Amazon Prime">Amazon Prime</SelectItem>
                    <SelectItem value="Spotify">Spotify</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => {
                const newPlatform = prompt("Ingresa el nombre de la nueva plataforma:");
                if (newPlatform && newPlatform.trim()) {
                  handleInputChange("platform", newPlatform.trim());
                }
              }}
              title="Agregar nueva plataforma"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="delivery-date" className="block text-sm font-medium mb-1">Fecha de Entrega *</Label>
          <Input
            id="delivery-date"
            type="date"
            required
            value={formData.deliveryDate}
            onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-1">Duración de la Suscripción *</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              required
              placeholder="Duración"
              value={formData.durationValue}
              onChange={(e) => handleInputChange("durationValue", e.target.value)}
              className="flex-1"
            />
            <Select value={formData.durationUnit} onValueChange={(value) => handleInputChange("durationUnit", value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Días</SelectItem>
                <SelectItem value="weeks">Semanas</SelectItem>
                <SelectItem value="months">Meses</SelectItem>
                <SelectItem value="years">Años</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="expiration-date" className="block text-sm font-medium mb-1">Fecha de Expiración</Label>
          <Input
            id="expiration-date"
            type="date"
            disabled
            value={formData.expirationDate}
            className="w-full bg-muted"
          />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Información de Reposición</h4>
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">¿La cuenta fue repuesta?</Label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="replaced"
                  value="no"
                  checked={formData.replaced === "no"}
                  onChange={(e) => handleInputChange("replaced", e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">No</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="replaced"
                  value="yes"
                  checked={formData.replaced === "yes"}
                  onChange={(e) => handleInputChange("replaced", e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Sí</span>
              </label>
            </div>
          </div>
          
          {showReplacementReason && (
            <div>
              <Label htmlFor="replacement-reason" className="block text-sm font-medium mb-1">Motivo de la Reposición</Label>
              <Textarea
                id="replacement-reason"
                rows={3}
                value={formData.replacementReason}
                onChange={(e) => handleInputChange("replacementReason", e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
