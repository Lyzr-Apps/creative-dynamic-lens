import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Send,
  Sparkles,
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

// Message type for chat history
interface ChatMessage {
  id: string
  type: 'system' | 'agent' | 'user'
  content: string
  timestamp: Date
  agentResponse?: TriviaResult
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
function getDifficultyColor(difficulty: string) {
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
function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'science':
      return <Brain className="h-4 w-4" />
    case 'sports':
      return <Trophy className="h-4 w-4" />
    default:
      return <Target className="h-4 w-4" />
  }
}

// Score Panel Component (Left Sidebar)
function ScorePanel({ score, category, difficulty, onNewGame }: {
  score: Score | null
  category: string
  difficulty: string
  onNewGame: () => void
}) {
  return (
    <div className="w-80 bg-gradient-to-b from-blue-950 to-purple-950 border-r border-blue-900 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Trivia Master</h2>
          <p className="text-xs text-blue-200">Chat Edition</p>
        </div>
      </div>

      <Separator className="bg-blue-800" />

      <div>
        <h3 className="text-sm font-semibold text-blue-200 mb-3">Game Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <span className="text-white text-sm">{category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-white text-sm">{difficulty}</span>
          </div>
        </div>
      </div>

      <Separator className="bg-blue-800" />

      {score && (
        <div>
          <h3 className="text-sm font-semibold text-blue-200 mb-3">Score</h3>
          <div className="space-y-3">
            <Card className="bg-blue-900/50 border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">Current</span>
                  <span className="text-2xl font-bold text-white">
                    {score.current_score}/{score.total_questions}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-900/50 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-200">Accuracy</span>
                  <span className="text-2xl font-bold text-white">
                    {score.accuracy_percentage}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-900/50 border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-orange-200">Streak</span>
                  <div className="flex items-center gap-1">
                    {score.current_streak > 0 && (
                      <Zap className="h-5 w-5 text-orange-400" />
                    )}
                    <span className="text-2xl font-bold text-white">
                      {score.current_streak}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/50 border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-purple-200">Best</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-5 w-5 text-purple-400" />
                    <span className="text-2xl font-bold text-white">
                      {score.best_streak}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full border-blue-700 hover:bg-blue-900"
          onClick={onNewGame}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          New Game
        </Button>
      </div>
    </div>
  )
}

// System Message Component
function SystemMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-blue-900/30 border border-blue-800 rounded-full px-4 py-2">
        <p className="text-sm text-blue-200">{content}</p>
      </div>
    </div>
  )
}

// Agent Message Component
function AgentMessage({ message, agentResponse, onAnswerSelect }: {
  message: string
  agentResponse?: TriviaResult
  onAnswerSelect?: (label: string, text: string) => void
}) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg h-fit">
        <Brain className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="bg-blue-900/50 border border-blue-800 rounded-lg p-4 max-w-2xl">
          <p className="text-white">{message}</p>
        </div>

        {agentResponse?.question && (
          <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 border border-blue-700 rounded-lg p-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="gap-1 border-blue-600 text-blue-200">
                {getCategoryIcon(agentResponse.question.category)}
                {agentResponse.question.category}
              </Badge>
              <Badge className={getDifficultyColor(agentResponse.question.difficulty)}>
                {agentResponse.question.difficulty}
              </Badge>
              <span className="text-xs text-blue-300 ml-auto">
                Question {agentResponse.question.question_number}
              </span>
            </div>

            <p className="text-white font-medium mb-4">{agentResponse.question.text}</p>

            <div className="grid grid-cols-1 gap-2">
              {agentResponse.question.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => onAnswerSelect?.(option.label, option.text)}
                  className="text-left p-3 rounded-lg border-2 border-blue-700 hover:border-blue-500 hover:bg-blue-800/50 transition-all bg-blue-950/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-blue-300 min-w-[1.5rem]">{option.label}</span>
                    <span className="text-white">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {agentResponse?.validation && (
          <div className={`rounded-lg p-4 max-w-2xl border-2 ${
            agentResponse.validation.is_correct
              ? 'bg-green-900/50 border-green-600'
              : 'bg-red-900/50 border-red-600'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {agentResponse.validation.is_correct ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="font-bold text-green-200">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-400" />
                  <span className="font-bold text-red-200">Incorrect</span>
                </>
              )}
            </div>
            <p className="text-white mb-3">{agentResponse.validation.feedback}</p>
            <div className="bg-black/20 rounded p-3">
              <p className="text-sm text-gray-200 mb-1">Explanation:</p>
              <p className="text-sm text-gray-100">{agentResponse.validation.explanation}</p>
            </div>
            {!agentResponse.validation.is_correct && (
              <div className="mt-2 text-sm text-gray-200">
                Correct answer: <span className="font-bold text-white">{agentResponse.validation.correct_answer}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// User Message Component
function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-3 mb-4 justify-end">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 max-w-md">
        <p className="text-white">{content}</p>
      </div>
    </div>
  )
}

// Loading Message Component
function LoadingMessage() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg h-fit">
        <Brain className="h-5 w-5 text-white" />
      </div>
      <div className="bg-blue-900/50 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
          <p className="text-blue-200">Thinking...</p>
        </div>
      </div>
    </div>
  )
}

// Game Setup Screen
function GameSetup({ onStart }: { onStart: (category: string, difficulty: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  const handleStart = () => {
    if (selectedCategory && selectedDifficulty) {
      onStart(selectedCategory, selectedDifficulty)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-pink-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-blue-900/50 border-blue-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-white">
            Trivia Master
          </CardTitle>
          <p className="text-lg mt-2 text-blue-200">
            Chat with your AI trivia host
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <Target className="h-5 w-5" />
              Select Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={selectedCategory === category
                    ? 'h-auto py-4 bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'h-auto py-4 border-blue-700 hover:bg-blue-900'
                  }
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

          <Separator className="bg-blue-800" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <Zap className="h-5 w-5" />
              Select Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  className={selectedDifficulty === difficulty
                    ? 'h-auto py-4 bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'h-auto py-4 border-blue-700 hover:bg-blue-900'
                  }
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-blue-800" />

          <Button
            size="lg"
            className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!selectedCategory || !selectedDifficulty}
            onClick={handleStart}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Chat Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Chat Interface Component
function ChatInterface({ category, difficulty, onNewGame }: {
  category: string
  difficulty: string
  onNewGame: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentScore, setCurrentScore] = useState<Score | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Start game on mount
  useEffect(() => {
    const startGame = async () => {
      setLoading(true)

      // Add system message
      setMessages([{
        id: Date.now().toString(),
        type: 'system',
        content: `Game Started - ${category} - ${difficulty}`,
        timestamp: new Date()
      }])

      try {
        const result = await callAIAgent(
          `Start a new trivia game with ${category} category at ${difficulty} difficulty`,
          AGENT_ID
        )

        if (result.success) {
          const triviaResponse = result.response as TriviaResponse
          setCurrentScore(triviaResponse.result.score)

          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'agent',
            content: triviaResponse.result.message,
            timestamp: new Date(),
            agentResponse: triviaResponse.result
          }])
        }
      } catch (err) {
        console.error('Error starting game:', err)
      } finally {
        setLoading(false)
      }
    }

    startGame()
  }, [category, difficulty])

  const handleAnswerSelect = async (label: string, text: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `${label} - ${text}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const result = await callAIAgent(
        `My answer is ${label} - ${text}`,
        AGENT_ID
      )

      if (result.success) {
        const triviaResponse = result.response as TriviaResponse
        setCurrentScore(triviaResponse.result.score)

        // Add agent response with validation
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: triviaResponse.result.message,
          timestamp: new Date(),
          agentResponse: triviaResponse.result
        }])

        // If there's a next question, add it after a brief delay
        if (triviaResponse.result.question) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              type: 'agent',
              content: triviaResponse.result.message,
              timestamp: new Date(),
              agentResponse: triviaResponse.result
            }])
          }, 500)
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-pink-950">
      {/* Left Sidebar - Score Panel */}
      <ScorePanel
        score={currentScore}
        category={category}
        difficulty={difficulty}
        onNewGame={onNewGame}
      />

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-blue-900/50 border-b border-blue-800 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trivia Chat</h2>
              <p className="text-sm text-blue-200">Answer questions in real-time</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => {
              if (msg.type === 'system') {
                return <SystemMessage key={msg.id} content={msg.content} />
              } else if (msg.type === 'agent') {
                return (
                  <AgentMessage
                    key={msg.id}
                    message={msg.content}
                    agentResponse={msg.agentResponse}
                    onAnswerSelect={handleAnswerSelect}
                  />
                )
              } else {
                return <UserMessage key={msg.id} content={msg.content} />
              }
            })}
            {loading && <LoadingMessage />}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="bg-blue-900/50 border-t border-blue-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-blue-200 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Click an option above to answer</span>
            </div>
          </div>
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

  const handleNewGame = () => {
    setGameState('setup')
    setGameConfig(null)
  }

  if (gameState === 'setup') {
    return <GameSetup onStart={handleStartGame} />
  }

  if (gameState === 'playing' && gameConfig) {
    return (
      <ChatInterface
        category={gameConfig.category}
        difficulty={gameConfig.difficulty}
        onNewGame={handleNewGame}
      />
    )
  }

  return null
}
