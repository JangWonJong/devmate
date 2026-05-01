import { createBrowserRouter } from "react-router-dom"
import LandingLayout from "./layouts/LandingLayout"
import {AppLayout} from "./layouts/AppLayout"
import { PostsPage } from "./pages/post/PostsPage"
import { NewPostPage } from "./pages/post/NewPostPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignupPage } from "./pages/auth/SignupPage"
import { PostDetailPage } from "./pages/post/PostDetailPage"
import { EditPostPage } from "./pages/post/EditPostPage"
import { RequireAuth } from "./routes/RequireAuth"
import { ReservationsPage } from "./pages/reservation/ReservationsPage"
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute"
import { MyStudiesPage } from "./pages/study/MyStudiesPage"
import { StudyReservationPage } from "./pages/reservation/StudyReservationPage"
import { MyPage } from "./pages/member/MyPage"
import { AccountSettingsPage } from "./pages/member/AccountSettingsPage"
import { MemberProfilePage } from "./pages/member/MemberProfilePage"
import { MyInquiriesPage } from "./pages/member/MyInquiriesPage"
import AdminRoute from "./routes/AdminRoute"
import AdminLayout from "./layouts/AdminLayout"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminSupportPage from "./pages/admin/AdminSupportPage"
import AdminSupportDetailPage from "./pages/admin/AdminSupportDetailPage"
import AdminMembersPage from "./pages/admin/AdminMembersPage"
import AdminMemberDetailPage from "./pages/admin/AdminMemberDetailPage"
import AdminActionLogPage from "./pages/admin/AdminActionLogPage"
import { DevLogListPage } from "./pages/devlog/DevLogListPage"
import { NewDevLogPage } from "./pages/devlog/NewDevLogPage"
import { DevLogDetailPage } from "./pages/devlog/DevLogDetailPage"
import { DevLogEditPage } from "./pages/devlog/DevLogEditPage"


export const router = createBrowserRouter([
    {   
         path: "/", element: <LandingLayout /> 
    },

        {
        element: <AppLayout />,
        children: [
            
            { path: "/posts", element: <PostsPage /> },

            { path: "/posts/:id", element: <PostDetailPage /> },
            { path: "/members/:memberId", element: <MemberProfilePage /> },

            { path: "/posts/new", element: <RequireAuth><NewPostPage /></RequireAuth> },
            { path: "/posts/:id/edit", element: <RequireAuth><EditPostPage /></RequireAuth> },

            { path: "/devlogs", element: <RequireAuth><DevLogListPage /></RequireAuth> },
            { path: "/devlogs/new", element: <RequireAuth><NewDevLogPage /></RequireAuth> },
            { path: "/devlogs/:devLogId", element: <DevLogDetailPage /> },
            { path: "/devlogs/:devLogId/edit", element: <RequireAuth><DevLogEditPage /></RequireAuth> },


            { path: "/reservations", element: <ReservationsPage /> },

            { path: "/login", element: <PublicOnlyRoute> <LoginPage /></PublicOnlyRoute> },
            { path: "/signup", element: <PublicOnlyRoute> <SignupPage /></PublicOnlyRoute> },
            { path: "/mypage", element: <RequireAuth><MyPage /></RequireAuth> },
            { path: "/mypage/settings", element: <RequireAuth><AccountSettingsPage /></RequireAuth> },
            { path: "/mypage/inquiries", element: <RequireAuth><MyInquiriesPage /></RequireAuth> },

            { path: "/mystudies", element:  <RequireAuth><MyStudiesPage /></RequireAuth> },
            { path: "/studies/:studyId/reservation", element:  <RequireAuth><StudyReservationPage /></RequireAuth> },
            
        ]
    },

    {
        element: <AdminRoute />,
        children: [
        {
            path: "/admin",
            element: <AdminLayout />,
            children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: "inquiries", element: <AdminSupportPage /> },
            { path: "inquiries/:inquiryId", element: <AdminSupportDetailPage /> },
            { path: "members", element: <AdminMembersPage /> },
            { path: "members/:memberId", element: <AdminMemberDetailPage /> },
            { path: "logs", element: <AdminActionLogPage /> },

            ],
        },
        ],
    },
])