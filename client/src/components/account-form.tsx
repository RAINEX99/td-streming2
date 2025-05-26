import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStreamingAccountSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import type { StreamingAccount } from "@shared/schema";

interface AccountFormProps {
  account?: StreamingAccount | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const form = useForm({
    resolver: zodResolver(insertStreamingAccountSchema),
    defaultValues: account ? {
      clientName: account.clientName,
      platform: account.platform,
      accountType: account.accountType,
      deliveryDate: account.deliveryDate,
      expirationDate: account.expirationDate,
      credentials: account.credentials ? JSON.stringify(account.credentials, null, 2) : "",
      notes: account.notes || "",
      price: account.price || "",
      status: account.status,
    } : {
      clientName: "",
      platform: "",
      accountType: "",
      deliveryDate: "",
      expirationDate: "",
      credentials: "",
      notes: "",
      price: "",
      status: "active",
    }
  });

  const handleSubmit = (data: any) => {
    // Parse credentials as JSON if provided
    if (data.credentials) {
      try {
        data.credentials = JSON.parse(data.credentials);
      } catch {
        // If JSON parsing fails, store as text
        data.credentials = { text: data.credentials };
      }
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clientName">Nombre del Cliente</Label>
          <Input
            id="clientName"
            {...form.register("clientName")}
            className="mt-1"
          />
          {form.formState.errors.clientName && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.clientName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Select
            onValueChange={(value) => form.setValue("platform", value)}
            defaultValue={form.getValues("platform")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona una plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Netflix">Netflix</SelectItem>
              <SelectItem value="Disney+">Disney+</SelectItem>
              <SelectItem value="HBO Max">HBO Max</SelectItem>
              <SelectItem value="Amazon Prime">Amazon Prime</SelectItem>
              <SelectItem value="Spotify">Spotify</SelectItem>
              <SelectItem value="YouTube Premium">YouTube Premium</SelectItem>
              <SelectItem value="Apple Music">Apple Music</SelectItem>
              <SelectItem value="Paramount+">Paramount+</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.platform && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.platform.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="accountType">Tipo de Cuenta</Label>
          <Select
            onValueChange={(value) => form.setValue("accountType", value)}
            defaultValue={form.getValues("accountType")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perfil">Perfil</SelectItem>
              <SelectItem value="Cuenta completa">Cuenta completa</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.accountType && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.accountType.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
          <Input
            id="deliveryDate"
            type="date"
            {...form.register("deliveryDate")}
            className="mt-1"
          />
          {form.formState.errors.deliveryDate && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.deliveryDate.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="expirationDate">Fecha de Expiración</Label>
          <Input
            id="expirationDate"
            type="date"
            {...form.register("expirationDate")}
            className="mt-1"
          />
          {form.formState.errors.expirationDate && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.expirationDate.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="price">Precio (Opcional)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...form.register("price")}
            className="mt-1"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="credentials">Credenciales de Acceso</Label>
        <Textarea
          id="credentials"
          {...form.register("credentials")}
          rows={4}
          placeholder="Usuario: ejemplo@email.com&#10;Contraseña: ••••••••&#10;PIN: 1234"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">Los datos se almacenarán de forma segura en la base de datos</p>
        {form.formState.errors.credentials && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.credentials.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          rows={3}
          placeholder="Información adicional sobre la cuenta..."
          className="mt-1"
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.notes.message}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar en Base de Datos"}
        </Button>
      </div>
    </form>
  );
}
