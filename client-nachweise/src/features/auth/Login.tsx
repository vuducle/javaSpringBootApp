"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/userSlice";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });
      const { accessToken, refreshToken, id } = response.data;
      dispatch(
        setUser({
          token: accessToken,
          refreshToken,
          id,
          email,
          isLoggedIn: true,
        })
      );
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 423) {
          setError(
            "Dein Konto ist vorübergehend gesperrt aufgrund zu vieler fehlgeschlagener Anmeldeversuche. Bitte warte 15 Minuten."
          );
        } else {
          setError("Ungültige E-Mail oder Passwort.");
        }
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 bg-background dark:bg-background"
      style={{ backgroundImage: "url(/background-pattern.svg)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="flex flex-col justify-center items-start p-8">
          <Image src="/logo.svg" alt="NachweisWelt Logo" width={200} height={50} />
          <h1 className="text-4xl font-bold mt-4 text-foreground">
            Die Welt der Ausbildungsnachweise.
          </h1>
          <p className="text-lg mt-2 text-muted-foreground">
            Für Azubis und Ausbilder. Nachweise eintragen, kontrollieren, speichern und jederzeit einsehen.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-sm border border-border bg-card/20 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Anmelden</CardTitle>
              <CardDescription>
                Tippe deine E-Mail Adresse und Passwort ein.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleLogin}>
                Anmelden
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
