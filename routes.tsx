import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { CategorySelection } from "./components/CategorySelection";
import { ThreatSelection } from "./components/ThreatSelection";
import { Result } from "./components/Result";
import { Profile } from "./components/Profile";
import { Report } from "./components/Report";
import { EmailConfirm } from "./components/EmailConfirm";
import { Alert } from "./components/Alert";
import { PsychologicalSupport } from "./components/PsychologicalSupport";
import { BreathingExercise } from "./components/BreathingExercise";
import { GroundingExercise } from "./components/GroundingExercise";
import { RelaxationExercise } from "./components/RelaxationExercise";
import { EmotionExercise } from "./components/EmotionExercise";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "category-selection", Component: CategorySelection },
      { path: "threat-selection/:category", Component: ThreatSelection },
      { path: "data", Component: CategorySelection },
      { path: "result", Component: Result },
      { path: "profile", Component: Profile },
      { path: "report", Component: Report },
      { path: "alert", Component: Alert },
      { path: "email-confirm", Component: EmailConfirm },
      { path: "psychological-support", Component: PsychologicalSupport },
      { path: "breathing-exercise", Component: BreathingExercise },
      { path: "grounding-exercise", Component: GroundingExercise },
      { path: "relaxation-exercise", Component: RelaxationExercise },
      { path: "emotion-exercise", Component: EmotionExercise },
    ],
  },
]);
