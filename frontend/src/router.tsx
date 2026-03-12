import React from "react";
import { createBrowserRouter } from "react-router-dom";
import {AppLayout} from "./ui/AppLayout"
import { PostsPage } from "./pages/PostsPage";
import { NewPostPage } from "./pages/NewPostPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { EditPostPage } from "./pages/EditPostPage";
import { RequireAuth } from "./auth/RequireAuth";
import { ReservationsPage } from "./pages/ReservationsPage";
import { PublicOnlyRoute } from "./auth/PublicOnlyRoute";
import { MyStudiesPage } from "./pages/MyStudiesPage";
import { StudyReservationPage } from "./pages/StudyReservationPage"

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <PostsPage /> },
            { path: "/posts/:id", element: <PostDetailPage /> },

            { path: "/posts/new", element: <RequireAuth><NewPostPage /></RequireAuth> },
            { path: "/posts/:id/edit", element: <RequireAuth><EditPostPage /></RequireAuth> },

            { path: "/reservations", element: <ReservationsPage /> },

            { path: "/login", element: <PublicOnlyRoute> <LoginPage /></PublicOnlyRoute> },
            { path: "/signup", element: <PublicOnlyRoute> <SignupPage /></PublicOnlyRoute> },

            { path: "/mystudies", element:  <RequireAuth><MyStudiesPage /></RequireAuth> },
            { path: "/studies/:studyId/reservation", element:  <RequireAuth><StudyReservationPage /></RequireAuth> },

        ]
    }
])