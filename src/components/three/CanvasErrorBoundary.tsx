import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * Keeps a WebGL failure from ending the lesson.
 *
 * Every word of Arabic, all navigation and all interactions live in the DOM,
 * so if the 3D layer dies the presentation is still completely usable. It
 * unmounts quietly rather than showing an error to a room of thirty students
 * over something decorative.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visible to whoever is debugging, invisible to the classroom.
    console.error('3D layer disabled after an error:', error, info.componentStack)
  }

  componentDidMount() {
    window.addEventListener('webglcontextlost', this.handleContextLost, true)
  }

  componentWillUnmount() {
    window.removeEventListener('webglcontextlost', this.handleContextLost, true)
  }

  private handleContextLost = (event: Event) => {
    // Prevent the default so the browser does not try to restore into a
    // half-torn-down React tree.
    event.preventDefault()
    console.error('WebGL context lost — continuing without the 3D layer.')
    this.setState({ failed: true })
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
