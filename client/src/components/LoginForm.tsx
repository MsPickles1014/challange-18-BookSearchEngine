

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';  // ✅ Import GraphQL mutation
import Auth from '../utils/auth';

const LoginForm = ({ handleModalClose }: { handleModalClose: () => void }) => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // ✅ Apollo Mutation Hook for Login
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data } = await loginUser({
        variables: { ...userFormData },
      });

      if (!data) throw new Error('Something went wrong!');

      Auth.login(data.login.token);  // ✅ Store token & login user
      handleModalClose(); // Close modal after login
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({ email: '', password: '' });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert || !!error} variant='danger'>

          {error ? error.message : 'Something went wrong with your login credentials!'}
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email || ''}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password || ''}
            required
          />
        </Form.Group>

        <Button disabled={loading || !(userFormData.email && userFormData.password)} type='submit' variant='success'>
          {loading ? 'Logging in...' : 'Submit'}
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
// // see SignupForm.js for comments
// import { useState } from 'react';
// import type { ChangeEvent, FormEvent } from 'react';
// import { Form, Button, Alert } from 'react-bootstrap';
// import { useMutation } from '@apollo/client';

// import { loginUser } from '../utils/API';
// import Auth from '../utils/auth';
// import type { User } from '../models/User';

// // biome-ignore lint/correctness/noEmptyPattern: <explanation>
// const LoginForm = ({}: { handleModalClose: () => void }) => {
//   const [userFormData, setUserFormData] = useState<User>({ username: '', email: '', password: '', savedBooks: [] });
//   const [validated] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);

//   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = event.target;
//     setUserFormData({ ...userFormData, [name]: value });
//   };

//   const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     // check if form has everything (as per react-bootstrap docs)
//     const form = event.currentTarget;
//     if (form.checkValidity() === false) {
//       event.preventDefault();
//       event.stopPropagation();
//     }

//     try {
//       const response = await loginUser(userFormData);

//       if (!response.ok) {
//         throw new Error('something went wrong!');
//       }

//       const { token } = await response.json();
//       Auth.login(token);
//     } catch (err) {
//       console.error(err);
//       setShowAlert(true);
//     }

//     setUserFormData({
//       username: '',
//       email: '',
//       password: '',
//       savedBooks: [],
//     });
//   };

//   return (
//     <>
//       <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
//         <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
//           Something went wrong with your login credentials!
//         </Alert>
//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='email'>Email</Form.Label>
//           <Form.Control
//             type='text'
//             placeholder='Your email'
//             name='email'
//             onChange={handleInputChange}
//             value={userFormData.email || ''}
//             required
//           />
//           <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
//         </Form.Group>

//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='password'>Password</Form.Label>
//           <Form.Control
//             type='password'
//             placeholder='Your password'
//             name='password'
//             onChange={handleInputChange}
//             value={userFormData.password || ''}
//             required
//           />
//           <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
//         </Form.Group>
//         <Button
//           disabled={!(userFormData.email && userFormData.password)}
//           type='submit'
//           variant='success'>
//           Submit
//         </Button>
//       </Form>
//     </>
//   );
// };

// export default LoginForm;
