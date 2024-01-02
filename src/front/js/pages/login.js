import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/home.css";

export const Login = () => {
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    actions.login(email, password);
    actions.setRegistrationInProgress(true);

    setTimeout(() => {
      actions.setRegistrationInProgress(false);
      if (store.registrationSuccess) {
        actions.setRegistrationSuccess(false);
        navigate("/");
      }
      actions.setRegistrationDoesntExist(false);
      actions.setRegistrationEmpty(false);
      actions.setRegistrationWrong(false);
    }, 2000);
  };

  return (
    <div className="text-center mt-5 home_max-width container">
      {!store.registrationSuccess && <h1>Log In</h1>}

      {store.registrationSuccess && (
        <div className="fs-3">You are successfully logged in!</div>
      )}

      {store.registrationEmpty && (
        <div className="fs-3">
          Email and password are required.
          <br />
          Try again!
        </div>
      )}

      {store.registrationWrong && (
        <div className="fs-3">
          Email or password are wrong.
          <br />
          Try again!
        </div>
      )}

      {!store.registrationSuccess && (
        <div>
          <form onSubmit={handleClick}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mt-3"
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mt-3"
            />
            <button
              type="submit"
              className="btn btn-dark mt-5"
              disabled={store.registrationInProgress}
            >
              Login
            </button>
          </form>

          <p className="mt-3 mb-5">
            Are you new here? <Link to="/signup">Sign up first</Link>
          </p>
        </div>
      )}
    </div>
  );
};
