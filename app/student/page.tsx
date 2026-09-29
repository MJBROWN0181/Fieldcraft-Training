"use client";
import { useEffect } from "react";
export default function StudentHome(){useEffect(()=>{const token=localStorage.getItem("fieldcraft-student-token");if(token)window.location.replace(`/join/${encodeURIComponent(token)}`);},[]);return <main style={{padding:32}}><h1>Fieldcraft training</h1><p>Open your company invitation link to access your profile and lessons.</p></main>}
