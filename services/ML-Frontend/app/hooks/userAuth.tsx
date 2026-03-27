// import { useSelector } from "react-redux";

export default function UserAuth() {
  // const { user } = useSelector((state: any) => state.auth);
  const user = false;
  if (user) {
    return true;
  } else {
    return false;
  }
}
