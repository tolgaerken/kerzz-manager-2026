import { Box, Typography, Card, CardContent, Grid, Paper } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { AppWindow, Shield, Key, Users, Lock } from "lucide-react";
import { useApplications, useRoles, usePermissions, useSsoUsers, useApiKeys } from "../hooks";

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  loading?: boolean;
}

function StatCard({ title, count, icon, href, loading }: StatCardProps) {
  return (
    <Link to={href} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          height: "100%",
          cursor: "pointer",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
            borderColor: "var(--color-primary)"
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "var(--color-primary)" }}
              >
                {loading ? "..." : count}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                opacity: 0.8
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SsoManagementPage() {
  // includeInactive=true ile tüm uygulamaları getir
  const { data: applications = [], isLoading: appsLoading } = useApplications(true);
  // all=true ile tüm uygulamalardan rolleri ve izinleri getir
  const { data: roles = [], isLoading: rolesLoading } = useRoles({ all: true, includeInactive: true });
  const { data: permissions = [], isLoading: permsLoading } = usePermissions({ all: true, includeInactive: true });
  const { data: users = [], isLoading: usersLoading } = useSsoUsers();
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useApiKeys();

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          SSO Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: "var(--color-muted-foreground)" }}>
          Uygulamalar, roller, izinler, kullanıcılar ve API anahtarlarını yönetin.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Uygulamalar"
            count={applications.length}
            icon={<AppWindow size={28} />}
            href="/sso-management/apps"
            loading={appsLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Roller"
            count={roles.length}
            icon={<Shield size={28} />}
            href="/sso-management/roles"
            loading={rolesLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="İzinler"
            count={permissions.length}
            icon={<Lock size={28} />}
            href="/sso-management/perms"
            loading={permsLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Kullanıcılar"
            count={users.length}
            icon={<Users size={28} />}
            href="/sso-management/users"
            loading={usersLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="API Anahtarları"
            count={apiKeys.length}
            icon={<Key size={28} />}
            href="/sso-management/api-keys"
            loading={apiKeysLoading}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper
          sx={{
            p: 3,
            backgroundColor: "var(--color-surface)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)"
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "var(--color-foreground)" }}>
            Hızlı Başlangıç
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }} paragraph>
            SSO (Single Sign-On) yönetim paneli, merkezi kimlik doğrulama ve yetkilendirme sistemini
            yönetmenizi sağlar.
          </Typography>
          <Box component="ul" sx={{ pl: 2, "& li": { mb: 1 } }}>
            <li>
              <Typography variant="body2">
                <strong>Uygulamalar:</strong> SSO sistemine kayıtlı uygulamaları yönetin
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Roller:</strong> Kullanıcı grupları için roller tanımlayın
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>İzinler:</strong> Detaylı erişim izinleri oluşturun ve rollere atayın
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Kullanıcılar:</strong> Uygulamaya atanmış kullanıcıları ve lisanslarını yönetin
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>API Anahtarları:</strong> Uygulama entegrasyonları için API anahtarları oluşturun
              </Typography>
            </li>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default SsoManagementPage;
