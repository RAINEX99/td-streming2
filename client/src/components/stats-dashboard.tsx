import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle, Database } from "lucide-react";

interface StatsData {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}

interface StatsDashboardProps {
  statistics: StatsData;
  dbStatus: 'connected' | 'connecting' | 'disconnected';
}

export function StatsDashboard({ statistics, dbStatus }: StatsDashboardProps) {
  const getDbStatusColor = () => {
    switch (dbStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  const getDbStatusText = () => {
    switch (dbStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      default:
        return 'Desconectado';
    }
  };

  const stats = [
    {
      title: "Estado DB",
      value: getDbStatusText(),
      icon: Database,
      color: "border-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: getDbStatusColor(),
    },
    {
      title: "Total de Cuentas",
      value: statistics.total.toString(),
      icon: Users,
      color: "border-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Cuentas Activas",
      value: statistics.active.toString(),
      icon: CheckCircle,
      color: "border-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-500",
    },
    {
      title: "Por Vencer",
      value: statistics.expiring.toString(),
      icon: Clock,
      color: "border-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-500",
    },
    {
      title: "Cuentas Expiradas",
      value: statistics.expired.toString(),
      icon: XCircle,
      color: "border-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.color} border-l-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
