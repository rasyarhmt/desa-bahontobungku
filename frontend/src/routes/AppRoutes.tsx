import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, type JSX } from "react";

import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const ProfilDesa = lazy(() => import("../pages/ProfilDesa"));
const Infografis = lazy(() => import("../pages/Infografis"));
const Login = lazy(() => import("../pages/Login"));
const Reset = lazy(() => import("../pages/ResetPassword"));
const Pelayanan = lazy(() => import("../pages/Pelayanan"));
const PelayananSuratUmum = lazy(() => import("../pages/PelayananSuratUmum"));
const Verifikasi = lazy(() => import("../pages/Verifikasi"));
const Media = lazy(() => import("../pages/Media"));
const Information = lazy(() => import("../pages/Information"));
const BeritaDetail = lazy(() => import("../pages/BeritaDetail"));
const Map = lazy(() => import("../pages/Map"));
const DashboardAdmin = lazy(() => import("../pages/admin/DashboardAdmin"));
const BerandaAdmin = lazy(() => import("../pages/admin/BerandaAdmin"));
const BeritaAdmin = lazy(() => import("../pages/admin/BeritaAdmin"));
const PengumumanAdmin = lazy(() => import("../pages/admin/PengumumanAdmin"));
const InfografisAdmin = lazy(() => import("../pages/admin/InfografisAdmin"));
const MediaAdmin = lazy(() => import("../pages/admin/MediaAdmin"));
const SuratAdmin = lazy(() => import("../pages/admin/SuratAdmin"));
const PelayananAdmin = lazy(() => import("../pages/admin/PelayananAdmin"));
const SettingAdmin = lazy(() => import("../pages/admin/SettingAdmin"));
const AparatAdmin = lazy(() => import("../pages/admin/AparatAdmin"));
const AdminManagement = lazy(() => import("../pages/admin/AdminManagement"));
const TemplateSuratAdmin = lazy(() => import("../pages/admin/TemplateSuratAdmin"));
const LogCetakAdmin = lazy(() => import("../pages/admin/LogCetakAdmin"));
const StatusKeluargaAdmin = lazy(() => import("../pages/admin/StatusKeluargaAdmin"));

const fallback = (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
  </div>
);

const AppRoutes = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Suspense fallback={fallback}><Home /></Suspense>} />
        <Route path="/ProfilDesa" element={<Suspense fallback={fallback}><ProfilDesa /></Suspense>} />
        <Route path="/Infografis" element={<Suspense fallback={fallback}><Infografis /></Suspense>} />
        <Route path="/Login" element={<Suspense fallback={fallback}><Login /></Suspense>} />
        <Route path="/ResetPassword" element={<Suspense fallback={fallback}><Reset /></Suspense>} />
        <Route path="/Pelayanan" element={<Suspense fallback={fallback}><Pelayanan /></Suspense>} />
        <Route path="/pelayanan/surat/:id" element={<Suspense fallback={fallback}><PelayananSuratUmum /></Suspense>} />
        <Route path="/verifikasi" element={<Suspense fallback={fallback}><Verifikasi /></Suspense>} />
        <Route path="/Media" element={<Suspense fallback={fallback}><Media /></Suspense>} />
        <Route path="/Information" element={<Suspense fallback={fallback}><Information /></Suspense>} />
        <Route path="/berita-detail/:id" element={<Suspense fallback={fallback}><BeritaDetail /></Suspense>} />
        <Route path="/Map" element={<Suspense fallback={fallback}><Map /></Suspense>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={fallback}><DashboardAdmin /></Suspense>
            </ProtectedRoute>
          }
        >
          <Route path="beranda" element={<Suspense fallback={fallback}><BerandaAdmin /></Suspense>} />
          <Route path="aparat" element={<Suspense fallback={fallback}><AparatAdmin /></Suspense>} />
          <Route path="berita" element={<Suspense fallback={fallback}><BeritaAdmin /></Suspense>} />
          <Route path="pengumuman" element={<Suspense fallback={fallback}><PengumumanAdmin /></Suspense>} />
          <Route path="infografis" element={<Suspense fallback={fallback}><InfografisAdmin /></Suspense>} />
          <Route path="media" element={<Suspense fallback={fallback}><MediaAdmin /></Suspense>} />
          <Route path="surat" element={<Suspense fallback={fallback}><SuratAdmin /></Suspense>} />
          <Route path="template-surat" element={<Suspense fallback={fallback}><TemplateSuratAdmin /></Suspense>} />
          <Route path="log-cetak" element={<Suspense fallback={fallback}><LogCetakAdmin /></Suspense>} />
          <Route path="pelayanan" element={<Suspense fallback={fallback}><PelayananAdmin /></Suspense>} />
          <Route path="status-keluarga" element={<Suspense fallback={fallback}><StatusKeluargaAdmin /></Suspense>} />
          <Route path="setting" element={<Suspense fallback={fallback}><SettingAdmin /></Suspense>} />
          <Route path="manajemen-admin" element={<Suspense fallback={fallback}><AdminManagement /></Suspense>} />
        </Route>

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
