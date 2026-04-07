import React, { Suspense, lazy, useContext } from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import EquityPage from '../Equity/EquityPage.js';

const MusicPage = lazy(() => import('../Music/MusicPage.js'));

const ShellLayout = () => (
    <div className="app-container">
        <div className="page-shell">
            <Outlet />
        </div>
    </div>
);

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
        return <Navigate to={ROUTES.MEDITATION} replace />;
    }
    return children;
};

const RouteLoader = ({ label }) => (
    <div className="route-loader" role="status" aria-live="polite">
        <p>{label}</p>
    </div>
);

const App = () => (
    <Router>
        <Navigation />
        <Routes>
            <Route path={ROUTES.DESKTOP_AUTH} element={<DesktopAuthPage />} />
            <Route element={<ShellLayout />}>
                <Route path={ROUTES.LANDING} element={<SplashPage />} />
                <Route path={ROUTES.SIGNUP} element={<RedirectIfAuthed><SignUpPage /></RedirectIfAuthed>} />
                <Route path={ROUTES.SIGNIN} element={<RedirectIfAuthed><SignInWithFirebase /></RedirectIfAuthed>} />
                <Route path={ROUTES.USAGE} element={<RequireAuth><UsagePage /></RequireAuth>} />
                <Route path={ROUTES.MEDITATION} element={<MeditationPage />} />
                <Route
                    path={ROUTES.MUSIC}
                    element={(
                        <Suspense fallback={<RouteLoader label="Loading music studio..." />}>
                            <MusicPage />
                        </Suspense>
                    )}
                />
                <Route path={ROUTES.LIGHTCYCLE} element={<RequireAuth><LightCyclePage /></RequireAuth>} />
                <Route path={ROUTES.EQUITY} element={<RequireAuth><EquityPage /></RequireAuth>} />
                <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
            </Route>
        </Routes>
    </Router>
);
export default withAuthentication(App);
/*
https://reactrouter.com/web/example/nesting
https://reactrouter.com/web/example/auth-workflow
  */
