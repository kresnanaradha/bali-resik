import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { MitraPage } from "@/features/mitra/MitraPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { UsersPage } from "@/features/users/UsersPage";
import { SchedulesPage } from "@/features/schedules/SchedulesPage";
import { ArticlesPage } from "@/features/articles/ArticlesPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dasbor" replace />} />
          <Route path="dasbor" element={<DashboardPage />} />
          <Route
            path="laporan"
            element={<ReportsPage />}
            handle={{ searchPlaceholder: "Cari laporan, ID, atau warga..." }}
          />
          <Route
            path="mitra"
            element={<MitraPage />}
            handle={{ searchPlaceholder: "Cari mitra berdasarkan nama atau wilayah..." }}
          />
          <Route path="analitik" element={<AnalyticsPage />} />
          <Route path="pengguna" element={<UsersPage />} />
          <Route
            path="penjadwalan"
            element={<SchedulesPage />}
            handle={{ searchPlaceholder: "Cari wilayah, TPS3R, atau jadwal..." }}
          />
          <Route
            path="artikel"
            element={<ArticlesPage />}
            handle={{ searchPlaceholder: "Cari judul artikel..." }}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin/dasbor" replace />} />
    </>,
  ),
);
