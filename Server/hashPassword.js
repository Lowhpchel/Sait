import bcrypt from 'bcryptjs';

const password = 'admin123';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log('Пароль:', password);
    console.log('Хеш:', hash);
    console.log('\n');
    console.log('СКОПИРУЙТЕ ЭТОТ SQL:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';`);
  });
});