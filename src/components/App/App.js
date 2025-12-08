import React, { useContext } from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js';
import { withAuthentication, AuthUserContext } from '../Session';

// Import different pages to view based on routing
import SignInPage from '../Session/SignInPage.js';
import SignUpPage from '../Session/SignUpForm.js';
import DesktopAuthPage from '../Session/DesktopAuthPage.js';

// Remaining pages
import MeditationPage from '../Meditation/MainPage.js';
import UsagePage from '../Usage/UsagePage.js';
import SplashPage from '../Splash/SplashPage.js';
import LightCyclePage from '../LightCycle/LightCyclePage.js';

const ShellLayout = () => {
    const location = useLocation();
    const isLightCycle = location.pathname.startsWith(ROUTES.LIGHTCYCLE);
    const appContainerClass = `app-container${isLightCycle ? ' app-container--full' : ''}`;
    const pageShellClass = `page-shell${isLightCycle ? ' page-shell--full' : ''}`;

    return (
        <div className={appContainerClass}>
            <div className={pageShellClass}>
                <Outlet />
            </div>
        </div>
    );
};

const SignInWithFirebase = () => {
    const firebase = useContext(FirebaseContext);
    return <SignInPage firebase={firebase} />;
};

const RequireAuth = ({ children }) => {
    const authUser = useContext(AuthUserContext);
    if (authUser?.loading) return null;
    if (!authUser?.auth) {
        return <Navigate to={ROUTES.SIGNIN} replace />;
    }
    return children;
};

const RedirectIfAuthed = ({ children }) => {
    const authUser = useContext(AuthUserContext);
    if (authUser?.loading) return null;
    if (authUser?.auth) {
        return <Navigate to={ROUTES.LIGHTCYCLE} replace />;
    }
    return children;
};

const App = () => (
    <Router>
        <Navigation />
        <Routes>
            <Route path={ROUTES.LANDING} element={<Navigate to={ROUTES.LIGHTCYCLE} replace />} />
            <Route path={ROUTES.DESKTOP_AUTH} element={<DesktopAuthPage />} />
            <Route element={<ShellLayout />}>
                <Route path={ROUTES.SIGNUP} element={<RedirectIfAuthed><SignUpPage /></RedirectIfAuthed>} />
                <Route path={ROUTES.SIGNIN} element={<RedirectIfAuthed><SignInWithFirebase /></RedirectIfAuthed>} />
                <Route path={ROUTES.USAGE} element={<RequireAuth><UsagePage /></RequireAuth>} />
                <Route path={ROUTES.MEDITATION} element={<MeditationPage />} />
                <Route path={ROUTES.LIGHTCYCLE} element={<LightCyclePage />} />
                <Route path="*" element={<SplashPage />} />
            </Route>
        </Routes>
    </Router>
);
export default withAuthentication(App);
/*
https://reactrouter.com/web/example/nesting
https://reactrouter.com/web/example/auth-workflow
  */
