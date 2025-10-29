import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import Capture from './pages/Capture';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Treatments from './pages/Treatments';
import History from './pages/History';
import Guide from './pages/Guide';
import About from './pages/About';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/landing">
          <Landing />
        </Route>
        <Route exact path="/menu">
          <Menu />
        </Route>
        <Route exact path="/capture">
          <Capture />
        </Route>
        <Route exact path="/upload">
          <Upload />
        </Route>
        <Route exact path="/treatments">
          <Treatments />
        </Route>
        <Route exact path="/history">
          <History />
        </Route>
        <Route exact path="/guide">
          <Guide />
        </Route>
        <Route exact path="/about">
          <About />
        </Route>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/">
          <Redirect to="/landing" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
