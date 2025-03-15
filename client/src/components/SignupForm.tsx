import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from "@apollo/client"; // ✅ Import GraphQL hook
import { SIGNUP_USER } from "../utils/mutations"; // ✅ Import GraphQL mutation
import Auth from '../utils/auth';
import type { User } from '../models/User';

const SignupForm = ({ handleModalClose }: { handleModalClose?: () => void }) => {
  const [addUser, { error }] = useMutation(SIGNUP_USER);

  // set initial form state
  const [userFormData, setUserFormData] = useState<User>({
    username: '', 
    email: '', 
    password: ''
  });

  // set state for form validation
  const [validated] = useState(false);
  // set state for alert
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!userFormData.username || !userFormData.email || !userFormData.password) {
      setShowAlert(true);
      return;
    }
  
    try {
      // ✅ Only sending username, email, and password
      const { data } = await addUser({ 
        variables: { 
          input: { 
            username: userFormData.username,
            email: userFormData.email,
            password: userFormData.password
          } 
        }
      });

      if (!data) {
        throw new Error("Signup failed!");
      }

      Auth.login(data.addUser.token); // ✅ Save token & log in user
  
      if (handleModalClose) {
        handleModalClose(); // ✅ Close modal if function exists
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setShowAlert(true);
    }

    setUserFormData({ username: '', email: '', password: '' });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert || !!error} variant="danger">
          {error ? error.message : "Something went wrong with your signup!"}
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='username'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            onChange={handleInputChange}
            value={userFormData.username || ''}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email || ''}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
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
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>

        <Button disabled={!(userFormData.username && userFormData.email && userFormData.password)} type='submit' variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
