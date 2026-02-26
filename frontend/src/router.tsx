import React from "react";
import { createBrowserRouter } from "react-router-dom";
import {AppLayout} from "./ui/AppLayout"
import { PostsPage } from "./pages/PostsPage";
import { NewPostPage } from "./pages/NewPostPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { EditPostPage } from "./pages/EditPostPage";

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <PostsPage /> },
            { path: "/posts/new", element: <NewPostPage /> },
            { path: "/posts/:id", element: <PostDetailPage /> },
            { path: "/posts/:id/edit", element: <EditPostPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/signup", element: <SignupPage /> },
        ]
    }
])