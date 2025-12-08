import React, { useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import { withFirebase } from '../Firebase';

const DesktopAuthPageBase = ({ firebase }) => {
  const [status, setStatus] = useState('Preparing desktop sign-in…');
  const [redirectStarted, setRedirectStarted] = useState(false);
  const [credential, setCredential] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const desktopParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      port: params.get('port'),
      state: params.get('state') || '',
      provider: params.get('provider') || 'google',
    };
  }, []);

  const { port, state, provider } = desktopParams;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await firebase.handleRedirectResult?.();
        if (!result || cancelled) return;
        const googleCredential = GoogleAuthProvider.credentialFromResult(result);
        if (!googleCredential) {
          throw new Error('Missing Google credential from redirect result.');
        }
        if (!googleCredential.idToken && !googleCredential.accessToken) {
          throw new Error('Desktop sign-in failed: Google tokens were not returned.');
        }
        setCredential({
          idToken: googleCredential.idToken || '',
          accessToken: googleCredential.accessToken || '',
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Desktop auth redirect result error', err);
          setStatus(err?.message || 'Failed to resume desktop sign-in. Close this tab and try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firebase]);

  useEffect(() => {
    if (!port) {
      setStatus('Missing desktop session details. Close this tab and try again from the desktop app.');
      return undefined;
    }

    const unsubscribe = firebase.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (!user && !redirectStarted) {
        setRedirectStarted(true);
        setStatus('Redirecting to Google sign-in…');
        try {
          await firebase.doGoogleRedirect();
        } catch (err) {
          console.error('Desktop auth redirect launch failed', err);
          setStatus(err?.message || 'Unable to start Google sign-in. Close this tab and try again.');
          setRedirectStarted(false);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [firebase, port, redirectStarted]);

  useEffect(() => {
    if (!port || !currentUser) return;
    if (!credential || (!credential.idToken && !credential.accessToken)) {
      setStatus('Waiting for Google credential…');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setStatus('Finishing desktop sign-in…');
        const refreshToken = currentUser.stsTokenManager?.refreshToken || '';
        const payload = {
          version: 1,
          provider,
          uid: currentUser.uid,
          email: currentUser.email || '',
          idToken: credential.idToken || '',
          accessToken: credential.accessToken || '',
          refreshToken,
          state,
        };
        const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
        if (!cancelled) {
          window.location.href = `http://127.0.0.1:${port}/cb#desktop=${encoded}`;
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Desktop auth bridge failed', err);
          setStatus(err?.message || 'Failed to complete desktop sign-in. Close this tab and try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [credential, currentUser, port, provider, state]);

  return (
    <div className="desktop-auth-page" style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <h1>Desktop sign-in</h1>
      <p>{status}</p>
      <p>If this page stays open, you can close it and restart the sign-in flow from the desktop app.</p>
    </div>
  );
};

export default withFirebase(DesktopAuthPageBase);
