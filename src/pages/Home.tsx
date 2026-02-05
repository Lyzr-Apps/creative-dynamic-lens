import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import {
  Brain,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCw,
  TrendingUp
} from 'lucide-react'

// Agent ID for Trivia Host Agent
const AGENT_ID = '69844cc478886bf72929718e'

// TypeScript interfaces from actual_test_response in response schema
interface QuestionOption {
  label: string
  text: string
}

interface Question {
  text: string
  category: string
  difficulty: string
  options: QuestionOption[]
  question_number: number
}

interface Score {
  current_score: number
  total_questions: number
  accuracy_percentage: number
  current_streak: number
  best_streak: number
}

interface Validation {
  user_answer: string
  correct_answer: string
  is_correct: boolean
  feedback: string
  explanation: string
}

interface TriviaResult {
  interaction_type: 'game_start' | 'question' | 'answer_validation'
  question?: Question
  score: Score
  message: string
  next_action: string
  validation?: Validation
}

interface TriviaResponse extends NormalizedAgentResponse {
  result: TriviaResult
}

// Categories and difficulties
const CATEGORIES = [
  'Science',
  'History',
  'Geography',
  'Sports',
  'Entertainment',
  'General Knowledge'
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Difficulty color mapping
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'hard':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'science':
      return <Brain className="h-4 w-4" />
    case 'sports':
      return <Trophy className="h-4 w-4" />
    default:
      return <Target className="h-4 w-4" />
  }
}

// Game Setup Screen Component
function GameSetup({ onStart }: { onStart: (category: string, difficulty: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  const handleStart = () => {
    if (selectedCategory && selectedDifficulty) {
      onStart(selectedCategory, selectedDifficulty)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trivia Master
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Test your knowledge across multiple categories and difficulties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="h-auto py-4"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Difficulty Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Select Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  className="h-auto py-4"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Start Button */}
          <Button
            size="lg"
            className="w-full text-lg"
            disabled={!selectedCategory || !selectedDifficulty}
            onClick={handleStart}
          >
            <Brain className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Score Display Component
function ScoreDisplay({ score }: { score: Score }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Score</p>
            <p className="text-2xl font-bold text-blue-600">
              {score.current_score}/{score.total_questions}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-green-600">
              {score.accuracy_percentage}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <Zap className="h-5 w-5" />
              {score.current_streak}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
            <p className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
              <Trophy className="h-5 w-5" />
              {score.best_streak}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Question Display Component
function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  validation,
  showValidation
}: {
  question: Question
  selectedAnswer: string | null
  onSelectAnswer: (label: string) => void
  validation: Validation | null
  showValidation: boolean
}) {
  const getOptionStyle = (option: QuestionOption) => {
    if (!showValidation) {
      return selectedAnswer === option.label
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
    }

    if (validation) {
      if (option.label === validation.correct_answer) {
        return 'border-green-500 bg-green-50 dark:bg-green-950'
      }
      if (option.label === validation.user_answer && !validation.is_correct) {
        return 'border-red-500 bg-red-50 dark:bg-red-950'
      }
    }
    return 'border-gray-200'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-1">
            {getCategoryIcon(question.category)}
            {question.category}
          </Badge>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl">
          Question {question.question_number}
        </CardTitle>
        <CardDescription className="text-base mt-3">
          {question.text}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.label}
              onClick={() => !showValidation && onSelectAnswer(option.label)}
              disabled={showValidation}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                option
              )} ${showValidation ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg min-w-[2rem]">{option.label}.</span>
                <span className="flex-1">{option.text}</span>
                {showValidation && validation && (
                  <>
                    {option.label === validation.correct_answer && (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    )}
                    {option.label === validation.user_answer && !validation.is_correct && (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    )}
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Validation Feedback Component
function ValidationFeedback({ validation }: { validation: Validation }) {
  return (
    <Card className={validation.is_correct ? 'border-green-500' : 'border-red-500'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validation.is_correct ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-green-600">Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-red-600" />
              <span className="text-red-600">Incorrect</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold mb-2">{validation.feedback}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground mb-2">Explanation:</p>
          <p className="text-sm">{validation.explanation}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Game Play Component
function GamePlay({
  category,
  difficulty,
  onRestart
}: {
  category: string
  difficulty: string
  onRestart: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<TriviaResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Start game on mount
  useState(() => {
    const startGame = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await callAIAgent(
          `Start a new trivia game with ${category} category at ${difficulty} difficulty`,
          AGENT_ID
        )
        if (result.success) {
          setResponse(result.response as TriviaResponse)
        } else {
          setError(result.error || 'Failed to start game')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }
    startGame()
  })

  const handleSelectAnswer = (label: string) => {
    setSelectedAnswer(label)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !response?.result.question) return

    const selectedOption = response.result.question.options.find(
      (opt) => opt.label === selectedAnswer
    )
    if (!selectedOption) return

    setLoading(true)
    setError(null)
    try {
      const result = await callAIAgent(
        `My answer is ${selectedAnswer} - ${selectedOption.text}`,
        AGENT_ID
      )
      if (result.success) {
        setResponse(result.response as TriviaResponse)
        setShowValidation(true)
      } else {
        setError(result.error || 'Failed to submit answer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    setLoading(true)
    setError(null)
    setSelectedAnswer(null)
    setShowValidation(false)
    try {
      const result = await callAIAgent(
        `Give me another ${category} question at ${difficulty} difficulty`,
        AGENT_ID
      )
      if (result.success) {
        setResponse(result.response as TriviaResponse)
      } else {
        setError(result.error || 'Failed to get next question')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-lg">Loading your trivia game...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trivia Master</h1>
            <p className="text-blue-200">
              {category} - {difficulty}
            </p>
          </div>
          <Button variant="outline" onClick={onRestart}>
            <RotateCw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Score Display */}
        {response?.result.score && <ScoreDisplay score={response.result.score} />}

        {/* Progress Bar */}
        {response?.result.score && response.result.score.total_questions > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white">
              <span>Progress</span>
              <span>
                {response.result.score.total_questions} question
                {response.result.score.total_questions !== 1 ? 's' : ''} answered
              </span>
            </div>
            <Progress
              value={
                response.result.score.total_questions > 0
                  ? (response.result.score.current_score /
                      response.result.score.total_questions) *
                    100
                  : 0
              }
              className="h-2"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Host Message */}
        {response?.result.message && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Brain className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-white italic">{response.result.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {response?.result.question && (
          <QuestionCard
            question={response.result.question}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
            validation={response.result.validation || null}
            showValidation={showValidation}
          />
        )}

        {/* Validation Feedback */}
        {showValidation && response?.result.validation && (
          <ValidationFeedback validation={response.result.validation} />
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!showValidation ? (
            <Button
              size="lg"
              className="flex-1"
              disabled={!selectedAnswer || loading}
              onClick={handleSubmitAnswer}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Answer
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1"
              disabled={loading}
              onClick={handleNextQuestion}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Next Question
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Home Component
export default function Home() {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup')
  const [gameConfig, setGameConfig] = useState<{
    category: string
    difficulty: string
  } | null>(null)

  const handleStartGame = (category: string, difficulty: string) => {
    setGameConfig({ category, difficulty })
    setGameState('playing')
  }

  const handleRestart = () => {
    setGameState('setup')
    setGameConfig(null)
  }

  if (gameState === 'setup') {
    return <GameSetup onStart={handleStartGame} />
  }

  if (gameState === 'playing' && gameConfig) {
    return (
      <GamePlay
        category={gameConfig.category}
        difficulty={gameConfig.difficulty}
        onRestart={handleRestart}
      />
    )
  }

  return null
}
