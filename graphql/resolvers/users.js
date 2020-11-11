const { UserInputError, AuthenticationError } = require('apollo-server');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { User, Message } = require('../../models');

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        let users = await User.findAll({
          attributes: ['username', 'imageUrl', 'createdAt'],
          where: { username: { [Op.ne]: user.username } },
        });
        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [['createdAt', 'DESC']],
        });
        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });
        return users;
      } catch (error) {
        throw error;
      }
    },
    login: async (parent, args) => {
      const { username, password } = args;
      const errors = {};
      try {
        if (username.trim() === '')
          errors.username = 'Username must not be empty';
        if (password.trim() === '')
          errors.password = 'Password must not be empty';

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors });
        }

        const user = await User.findOne({
          where: { username },
        });

        if (!user) {
          errors.username = 'user not found';
          throw new UserInputError('user not found', { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          errors.password = 'password is incorrect';
          throw new UserInputError('password is incorrect', { errors });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });

        return {
          ...user.toJSON(),
          token,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  Mutation: {
    register: async (parent, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};
      try {
        // Validate input data
        if (email.trim() === '') errors.email = 'Email must not be empty';
        if (username.trim() === '')
          errors.username = 'Username must not be empty';
        if (password.trim() === '')
          errors.password = 'Password must not be empty';
        if (confirmPassword.trim() === '')
          errors.confirmPassword = 'Repeat Password must not be empty';
        if (password !== confirmPassword)
          errors.confirmPassword = 'password must match';

        //Check if username / email exists
        // const userByUsername = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });
        // if (userByUsername) errors.username = 'Username is taken';
        // if (userByEmail) errors.email = 'Email is taken';

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
        //Hash Password
        password = await bcrypt.hash(password, 6);

        //Create user
        const user = await User.create({
          username,
          email,
          password,
        });
        //Return user
        return user;
      } catch (error) {
        console.log(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          error.errors.forEach(
            (e) =>
              (errors[e.path.split('.')[1]] = `${
                e.path.split('.')[1]
              } is already taken`)
          );
        } else if (error.name === 'SequelizeValidationError') {
          error.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError('Bad Input', { errors });
      }
    },
  },
};
