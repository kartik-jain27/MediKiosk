import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { InterviewQuestion } from "@/types/api";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function QuestionRenderer({ question, onAnswer, disabled }: { question: InterviewQuestion; onAnswer: (answer: string) => void; disabled?: boolean }) {
  const { t } = useTranslation();
  const language = useSessionStore((state) => state.language);
  const [answer, setAnswer] = useState("");
  const voice = useVoiceInput(language, setAnswer);
  useEffect(() => setAnswer(""), [question.id]);
  if (question.type === "multiple_choice") return <div className="answer-options">{(question.options ?? []).map((option) => <button className="option-button" key={option} disabled={disabled} onClick={() => onAnswer(option)}>{option}</button>)}</div>;
  if (question.type === "yes_no") return <div className="yes-no"><button className="option-button" disabled={disabled} onClick={() => onAnswer("Yes")}>{t("interview.yes")}</button><button className="option-button" disabled={disabled} onClick={() => onAnswer("No")}>{t("interview.no")}</button></div>;
  if (question.type === "scale") return <div className="scale-input"><input type="range" min="1" max="10" value={answer || "5"} disabled={disabled} onChange={(event) => setAnswer(event.target.value)} aria-label={question.text} /><output>{answer || "5"} / 10</output><button className="button button-primary" disabled={disabled} onClick={() => onAnswer(answer || "5")}>{t("common.continue")}</button></div>;
  return <div className="text-answer"><label>{t("interview.answer")}<input value={answer} disabled={disabled} onChange={(event) => setAnswer(event.target.value)} placeholder={t("interview.placeholder")} /></label><div className="answer-actions">{voice.isSupported && <button className="button button-outline" disabled={disabled} onClick={voice.isListening ? voice.stop : voice.start}>{voice.isListening ? t("interview.stopListening") : `🎙 ${t("interview.speak")}`}</button>}<button className="button button-primary" disabled={disabled || !answer.trim()} onClick={() => onAnswer(answer.trim())}>{t("common.continue")}</button></div>{voice.error && <p className="form-error" role="alert">{t(`interview.${voice.error}`)}</p>}</div>;
}
