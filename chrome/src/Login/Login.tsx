export function Login({
  onPrimaryButtonClick,
}: {
  onPrimaryButtonClick: (isAuthenticated: boolean) => void;
}) {
  return (
    <div>
      <h1>Login to eyeballs</h1>
      <button onClick={() => onPrimaryButtonClick(true)}>Log in</button>
    </div>
  );
}
