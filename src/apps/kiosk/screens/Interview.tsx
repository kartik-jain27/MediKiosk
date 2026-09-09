import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuestionRenderer } from "@/apps/kiosk/components/QuestionRenderer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function Interview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const speak = useTextToSpeech();
  const { interviewId, currentQuestion, progress, language, setQuestion, setProgress, setAlert } = useSessionStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const question = useMemo(() => currentQuestion && ({
    ...currentQuestion,
    text: t(`interview.questions.${currentQuestion.stage}`, { defaultValue: currentQuestion.text }),
    options: currentQuestion.options?.map((option) => t(`interview.options.${option}`, { defaultValue: option })),
  }), [currentQuestion, t]);
  useEffect(() => { if (question) speak(question.text, language); }, [question, language, speak]);
  useEffect(() => { if (!currentQuestion && !interviewId) navigate("/kiosk/mode-select", { replace: true }); }, [currentQuestion, interviewId, navigate]);
  const answer = async (value: string) => {
    if (!interviewId || !currentQuestion) return;
    setSubmitting(true); setError("");
    try { const response = await api.answerInterview(interviewId, { questionId: currentQuestion.id, answer: value }); setProgress(response.progress); setQuestion(response.nextQuestion); if (response.redFlag) { setAlert(response.redFlag); navigate("/kiosk/alert"); } else if (!response.nextQuestion) navigate("/kiosk/documents"); } catch { setError(t("common.error")); } finally { setSubmitting(false); }
  };
  if (!question) return null;
  return <main className="screen interview-screen"><div className="question-status"><span>{t("interview.step", { current: progress?.stageIndex ?? 1, total: progress?.totalStages ?? 9 })}</span><button className="icon-button" onClick={() => speak(question.text, language)} aria-label={t("interview.replay")}>🔊</button></div>
    <AnimatePresence mode="wait"><motion.section key={question.id} className="question-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}><p className="stage-name">{t(`interview.stages.${question.stage}`)}</p><h1>{question.text}</h1><QuestionRenderer question={question} disabled={submitting} onAnswer={(value) => void answer(value)} />{submitting && <p className="processing" role="status">{t("common.pleaseWait")}</p>}{error && <p className="form-error" role="alert">{error}</p>}</motion.section></AnimatePresence>
  </main>;
}
