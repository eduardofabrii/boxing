const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
}

export interface AuthResponse {
  message: string
  user: User
  success: boolean
}

export interface ApiError {
  message?: string
  [key: string]: any
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data,
        }
      }

      return data
    } catch (error: any) {
      console.error('API Request Error:', error)
      
      if (error.status) {
        // Erro HTTP estruturado
        throw error
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Erro de rede/conexão
        throw {
          status: 0,
          statusText: 'Network Error',
          data: { message: 'Não foi possível conectar com o servidor. Verifique sua conexão.' }
        }
      } else {
        // Outros erros
        throw {
          status: 500,
          statusText: 'Internal Error',
          data: { message: 'Erro interno. Tente novamente.' }
        }
      }
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUserById(id: number): Promise<User> {
    return this.makeRequest<User>(`/user/${id}`)
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health')
  }

  // Métodos de utilidade para gerenciar autenticação local
  saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxing_user', JSON.stringify(user))
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('boxing_user')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('boxing_user')
    }
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null
  }
}

export const authService = new AuthService()
export default authService
