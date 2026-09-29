import StudentPortal from "./student-portal";
export default async function JoinPage({params}:{params:Promise<{token:string}>}) { const {token}=await params; return <StudentPortal token={token} />; }
