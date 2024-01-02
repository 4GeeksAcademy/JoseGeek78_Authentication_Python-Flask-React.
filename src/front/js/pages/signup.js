import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/home.css";

export const Signup = () => {
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    actions.register(email, password);
    actions.setRegistrationInProgress(true);

    setTimeout(() => {
      actions.setRegistrationInProgress(false);
      if (store.registrationSuccess) {
        actions.setRegistrationSuccess(false);
        navigate("/login");
      }
      actions.setRegistrationExists(false);
      actions.setRegistrationEmpty(false);
    }, 2000);
  };

  return (
    <div className="text-center mt-5 home_max-width container">
      {!store.registrationSuccess && <h1>Create account</h1>}

      {store.registrationEmpty && (
        <div className="fs-3">
          Email and password are required.
          <br />
          Try again!
        </div>
      )}

      {store.registrationExists && (
        <div className="fs-3">
          Sorry!
          <br />
          That user already exists!
        </div>
      )}

      {store.registrationSuccess && (
        <div className="fs-3">
          You are successfully registered!
          <br />
          Now you'll be redirected so you can <b>log in</b>!
        </div>
      )}

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
            Sign up
          </button>
        </form>

        <p className="mt-3 mb-5">
          You already have an account? <Link to="/login"> Log In then </Link>
        </p>
      </div>
    </div>
  );
};
