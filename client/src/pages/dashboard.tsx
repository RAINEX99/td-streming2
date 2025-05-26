import { useState } from "react";
import { DatabaseConfig } from "@/components/database-config";
import { StatsDashboard } from "@/components/stats-dashboard";
import { AccountsTable } from "@/components/accounts-table";
import { AccountForm } from "@/components/account-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/use-accounts";
import { useDatabase } from "@/hooks/use-database";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database, FolderSync, FileDown, FileSpreadsheet, Upload, Clock, Sun, Moon, Search } from "lucide-react";
import type { StreamingAccount } from "@shared/schema";

export default function Dashboard() {
  const [showConfig, setShowConfig] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<StreamingAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [theme, setTheme] = useState("light");
  
  const { toast } = useToast();
  const { dbStatus, testConnection, isConnecting } = useDatabase();
  const { 
    accounts, 
    statistics, 
    isLoading, 
    refetch,
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
    exportAccounts,
    importAccounts
  } = useAccounts({
    search: searchTerm,
    platform: platformFilter,
    accountType: typeFilter
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleCreateAccount = async (data: any) => {
    try {
      await createAccountMutation.mutateAsync(data);
      setShowAccountForm(false);
      toast({ title: "Cuenta creada exitosamente" });
    } catch (error) {
      toast({ title: "Error al crear cuenta", variant: "destructive" });
    }
  };

  const handleUpdateAccount = async (data: any) => {
    if (!editingAccount) return;
    
    try {
      await updateAccountMutation.mutateAsync({ id: editingAccount.id, data });
      setShowAccountForm(false);
      setEditingAccount(null);
      toast({ title: "Cuenta actualizada exitosamente" });
    } catch (error) {
      toast({ title: "Error al actualizar cuenta", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await deleteAccountMutation.mutateAsync(id);
      toast({ title: "Cuenta eliminada exitosamente" });
    } catch (error) {
      toast({ title: "Error al eliminar cuenta", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      await exportAccounts();
      toast({ title: "Cuentas exportadas exitosamente" });
    } catch (error) {
      toast({ title: "Error al exportar cuentas", variant: "destructive" });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAccounts(data.accounts || data);
      toast({ title: "Cuentas importadas exitosamente" });
      event.target.value = "";
    } catch (error) {
      toast({ title: "Error al importar cuentas", variant: "destructive" });
    }
  };

  const handleSync = () => {
    refetch();
    toast({ title: "Sincronización iniciada" });
  };

  const filterExpiring = () => {
    // This would filter accounts expiring within 7 days
    // Implementation would depend on how you want to handle this filter
    toast({ title: "Mostrando cuentas por vencer" });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">TD-Streaming Database Edition</h1>
          <p className="text-muted-foreground">Administra tus cuentas de streaming con persistencia en base de datos</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2 border ${
              dbStatus === 'connected' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
              dbStatus === 'connecting' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
              'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span>
                {dbStatus === 'connected' ? 'Conectado' : 
                 dbStatus === 'connecting' ? 'Conectando...' : 
                 'Desconectado'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowConfig(!showConfig)}
            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Database Configuration */}
      {showConfig && (
        <DatabaseConfig 
          onClose={() => setShowConfig(false)}
          onTestConnection={testConnection}
          isConnecting={isConnecting}
          connectionStatus={dbStatus}
        />
      )}

      {/* Statistics Dashboard */}
      <StatsDashboard statistics={statistics} dbStatus={dbStatus} />

      {/* Controls and Filters */}
      <div className="bg-card p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowAccountForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
            
            <Button onClick={handleSync} variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600">
              <FolderSync className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>

            <Button onClick={handleExport} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <Button onClick={handleExport} variant="outline" className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar a Excel
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>

            <Button onClick={filterExpiring} variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500">
              <Clock className="h-4 w-4 mr-2" />
              Por Vencer
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las plataformas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plataformas</SelectItem>
                <SelectItem value="Netflix">Netflix</SelectItem>
                <SelectItem value="Disney+">Disney+</SelectItem>
                <SelectItem value="HBO Max">HBO Max</SelectItem>
                <SelectItem value="Amazon Prime">Amazon Prime</SelectItem>
                <SelectItem value="Spotify">Spotify</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Perfil">Perfil</SelectItem>
                <SelectItem value="Cuenta completa">Cuenta completa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre de cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <AccountsTable 
        accounts={accounts}
        isLoading={isLoading}
        onEdit={(account) => {
          setEditingAccount(account);
          setShowAccountForm(true);
        }}
        onDelete={handleDeleteAccount}
        dbStatus={dbStatus}
      />

      {/* Account Form Modal */}
      <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Editar Cuenta" : "Nueva Cuenta"}
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            account={editingAccount}
            onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
            onCancel={() => {
              setShowAccountForm(false);
              setEditingAccount(null);
            }}
            isLoading={createAccountMutation.isPending || updateAccountMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
