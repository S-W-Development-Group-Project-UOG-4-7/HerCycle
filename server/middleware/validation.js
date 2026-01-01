const validateAge = (req, res, next) => {
  const { age } = req.body;

  if (!age) {
    return res.status(400).json({
      success: false,
      error: { message: 'Age is required' },
    });
  }

  const ageNum = parseInt(age);

  if (isNaN(ageNum) || ageNum < 10 || ageNum > 18) {
    return res.status(400).json({
      success: false,
      error: { message: 'Age must be between 10 and 18' },
    });
  }

  next();
};

const validateSignup = (req, res, next) => {
  const { username, password, birthday, age } = req.body;

  if (!username || !password || !birthday || !age) {
    return res.status(400).json({
      success: false,
      error: { message: 'Username, password, birthday, and age are required' },
    });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      error: { message: 'Username must be between 3 and 20 characters' },
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { message: 'Password must be at least 6 characters' },
    });
  }

  next();
};

export { validateAge, validateSignup };
