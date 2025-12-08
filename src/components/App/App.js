import React, { useContext } from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js';
import { withAuthentication } from '../Session';

// Import different pages to view based on routing
import SignInPage from '../Session/SignInPage.js';
import SignUpPage from '../Session/SignUpForm.js';

// Remaining pages
import MeditationPage from '../Meditation/MainPage.js';
import UsagePage from '../Usage/UsagePage.js';
import SplashPage from '../Splash/SplashPage.js';

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

const App = () => (
    <Router>
        <Navigation />
        <Routes>
            <Route path={ROUTES.LANDING} element={<SplashPage />} />
            <Route element={<ShellLayout />}>
                <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
                <Route path={ROUTES.SIGNIN} element={<SignInWithFirebase />} />
                <Route path={ROUTES.USAGE} element={<UsagePage />} />
                <Route path={ROUTES.MEDITATION} element={<MeditationPage />} />
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
