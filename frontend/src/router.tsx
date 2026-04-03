import { createBrowserRouter } from "react-router-dom"
import LandingLayout from "./laytouts/LandingLayout";
import {AppLayout} from "./laytouts/AppLayout"
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
import { MemberProfilePage } from "./pages/member/MemberProfilePage";


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

            { path: "/reservations", element: <ReservationsPage /> },

            { path: "/login", element: <PublicOnlyRoute> <LoginPage /></PublicOnlyRoute> },
            { path: "/signup", element: <PublicOnlyRoute> <SignupPage /></PublicOnlyRoute> },
            { path: "/mypage", element: <RequireAuth><MyPage /></RequireAuth> },
            { path: "/mypage/settings", element: <RequireAuth><AccountSettingsPage /></RequireAuth> },

            { path: "/mystudies", element:  <RequireAuth><MyStudiesPage /></RequireAuth> },
            { path: "/studies/:studyId/reservation", element:  <RequireAuth><StudyReservationPage /></RequireAuth> },
            
        ]
    }
])