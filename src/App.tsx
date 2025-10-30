import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Pages
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import Capture from './pages/Capture';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Treatments from './pages/Treatments';
import History from './pages/History';
import Guide from './pages/Guide';
import About from './pages/About';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // -----------------------------------------------------------------
  // 1. Configure native platform (splash, status bar)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide splash screen
      SplashScreen.hide().catch((e) => {
        console.warn('SplashScreen.hide() failed', e);
      });

      // Configure status bar
      StatusBar.setStyle({ style: Style.Light }).catch((e) => {
        console.warn('StatusBar.setStyle() failed', e);
      });
      
      // Set status bar overlay to false (prevents overlap)
      StatusBar.setOverlaysWebView({ overlay: false }).catch((e) => {
        console.warn('StatusBar.setOverlaysWebView() failed', e);
      });
    }
  }, []);

  // -----------------------------------------------------------------
  // 2. Routes (unchanged, just grouped for readability)
  // -----------------------------------------------------------------
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* ----- Main pages ----- */}
          <Route exact path="/landing" component={Landing} />
          <Route exact path="/menu" component={Menu} />
          <Route exact path="/capture" component={Capture} />
          <Route exact path="/upload" component={Upload} />
          <Route exact path="/treatments" component={Treatments} />
          <Route exact path="/history" component={History} />
          <Route exact path="/guide" component={Guide} />
          <Route exact path="/about" component={About} />
          <Route exact path="/home" component={Home} />

          {/* ----- Default redirect ----- */}
          <Route exact path="/">
            <Redirect to="/landing" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;