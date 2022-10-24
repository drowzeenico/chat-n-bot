import { terminal } from 'terminal-kit';

const t = terminal;

t.blue().bold('WELCOME TO CHAT-N-BOT\n');
t.blue('Please, log in or sign up\n');

const items = ['▷ Log in', '▷ Sign up', '▷ Quit'];

const options = {
  style: t.inverse,
  selectedStyle: t.dim.blue.bgGreen,
};

t.singleColumnMenu(items, options, (error, response) => {
  const menuItem = response.selectedIndex;
  switch (menuItem) {
    case 0:
      {
        t('\nLogin: ').inputField(undefined, (e, login) => {
          t('\nPassword: ').inputField(undefined, (e, password) => {
            t.red(login, password);
            process.exit();
          });
        });
      }
      break;

    case 1:
      {
        t('\nE-mail: ').inputField(undefined, (e, email) => {
          t('\nLogin: ').inputField(undefined, (e, login) => {
            t('\nPassword: ').inputField(undefined, (e, password) => {
              t.red(login, password);
              process.exit();
            });
          });
        });
      }
      break;

    case 2:
      {
        process.exit();
      }
      break;
  }
});
