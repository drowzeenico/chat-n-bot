export namespace UserTypes {
  export type Credentials = {
    login: string;
    password: string;
  };

  export type RegistrationData = {
    login: string;
    password: string;
    email: string;
  };
}
