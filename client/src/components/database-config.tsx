import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Plug, Save, X } from "lucide-react";

interface DatabaseConfigProps {
  onClose: () => void;
  onTestConnection: () => void;
  isConnecting: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export function DatabaseConfig({ onClose, onTestConnection, isConnecting, connectionStatus }: DatabaseConfigProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-purple-600" />
          <CardTitle>Configuración de Base de Datos</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">PostgreSQL</Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Form */}
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Conexión</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="db-host">Host</Label>
                <Input id="db-host" placeholder="localhost" />
              </div>
              <div>
                <Label htmlFor="db-port">Puerto</Label>
                <Input id="db-port" type="number" placeholder="5432" />
              </div>
            </div>

            <div>
              <Label htmlFor="db-name">Base de Datos</Label>
              <Input id="db-name" placeholder="streaming_accounts" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="db-user">Usuario</Label>
                <Input id="db-user" placeholder="postgres" />
              </div>
              <div>
                <Label htmlFor="db-password">Contraseña</Label>
                <Input id="db-password" type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={onTestConnection} disabled={isConnecting}>
                <Plug className="h-4 w-4 mr-2" />
                {isConnecting ? "Probando..." : "Probar Conexión"}
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>

          {/* API Documentation */}
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Endpoints API</h4>
            
            <div className="space-y-3 text-sm">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                  <code>/api/accounts</code>
                </div>
                <p className="text-muted-foreground">Obtener todas las cuentas</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                  <code>/api/accounts</code>
                </div>
                <p className="text-muted-foreground">Crear nueva cuenta</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                  <code>/api/accounts/:id</code>
                </div>
                <p className="text-muted-foreground">Actualizar cuenta</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                  <code>/api/accounts/:id</code>
                </div>
                <p className="text-muted-foreground">Eliminar cuenta</p>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-medium mb-2">Schema de Base de Datos</h5>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                <pre>{`CREATE TABLE streaming_accounts (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    delivery_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    credentials JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);`}</pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
