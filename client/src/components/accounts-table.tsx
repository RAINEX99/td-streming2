import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Database, FolderOpen, AlertTriangle, RefreshCw } from "lucide-react";
import type { StreamingAccount } from "@shared/schema";

interface AccountsTableProps {
  accounts: StreamingAccount[];
  isLoading: boolean;
  onEdit: (account: StreamingAccount) => void;
  onDelete: (id: number) => void;
  dbStatus: 'connected' | 'connecting' | 'disconnected';
}

export function AccountsTable({ accounts, isLoading, onEdit, onDelete, dbStatus }: AccountsTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getStatusColor = (account: StreamingAccount) => {
    const now = new Date();
    const expirationDate = new Date(account.expirationDate);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (expirationDate < now) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    } else if (expirationDate <= oneWeekFromNow) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    } else {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  const getStatusText = (account: StreamingAccount) => {
    const now = new Date();
    const expirationDate = new Date(account.expirationDate);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (expirationDate < now) {
      return "Expirada";
    } else if (expirationDate <= oneWeekFromNow) {
      return "Por vencer";
    } else {
      return "Activa";
    }
  };

  const getDaysRemaining = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} días vencida`;
    } else if (diffDays === 0) {
      return "Vence hoy";
    } else {
      return `${diffDays} días`;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const iconClass = "w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold";
    
    switch (platform) {
      case "Netflix":
        return <div className={`${iconClass} bg-red-600`}>N</div>;
      case "Disney+":
        return <div className={`${iconClass} bg-blue-600`}>D+</div>;
      case "HBO Max":
        return <div className={`${iconClass} bg-purple-600`}>HBO</div>;
      case "Amazon Prime":
        return <div className={`${iconClass} bg-blue-500`}>AP</div>;
      case "Spotify":
        return <div className={`${iconClass} bg-green-500`}>S</div>;
      default:
        return <div className={`${iconClass} bg-gray-600`}>{platform.charAt(0)}</div>;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-muted-foreground">Cargando datos desde la base de datos...</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Database Error State
  if (dbStatus === 'disconnected') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Error de Conexión a la Base de Datos</h3>
          <p className="text-muted-foreground mb-4">No se pudo conectar a la base de datos. Verifica la configuración.</p>
          <Button variant="destructive">
            Reintentar Conexión
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No hay cuentas en la base de datos</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando una nueva cuenta o verifica la conexión a la base de datos</p>
          <Button>
            Verificar Conexión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <span>Cliente</span>
                  <Database className="h-3 w-3 text-purple-600" />
                </div>
              </TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha Entrega</TableHead>
              <TableHead>Fecha Expiración</TableHead>
              <TableHead>Días Restantes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium">{account.clientName}</div>
                    <div className="text-sm text-muted-foreground">ID: {account.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(account.platform)}
                    <span>{account.platform}</span>
                  </div>
                </TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.deliveryDate}</TableCell>
                <TableCell>{account.expirationDate}</TableCell>
                <TableCell>{getDaysRemaining(account.expirationDate)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(account)}>
                    {getStatusText(account)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(account)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de {account.clientName} de la base de datos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(account.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
