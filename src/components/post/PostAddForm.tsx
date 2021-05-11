import { FormEventHandler } from 'react';

const PostAddForm: React.FC<{
  submitHandler: FormEventHandler<HTMLFormElement>;
}> = ({ submitHandler }) => {
  return (
    <form onSubmit={submitHandler}>
      <input type="file" name="file" required />
      <textarea autoComplete="off" name="text" />
      <button>Send new post</button>
    </form>
  );
};

export default PostAddForm;
