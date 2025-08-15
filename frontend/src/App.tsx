import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RecipePage from './components/RecipePage';
import AdminPanel from './components/AdminPanel';

const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

const isAdmin = () => {
  const isAdminString = localStorage.getItem('is_admin');
  return isAdminString ? JSON.parse(isAdminString) : false;
};

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          {isLoggedIn() ? <Redirect to="/recipe" /> : <LoginForm />}
        </Route>
        <Route path="/recipe">
          {isLoggedIn() ? <RecipePage /> : <Redirect to="/" />}
        </Route>
        <Route path="/admin">
          {isLoggedIn() && isAdmin() ? <AdminPanel /> : <Redirect to="/" />}
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
