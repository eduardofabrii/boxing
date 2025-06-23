import { useEffect, useState } from 'react'

export function useResourcePreloader(resources: string[] = []) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (resources.length === 0) {
      setIsLoaded(true)
      setProgress(100)
      return
    }

    let loadedCount = 0
    const totalResources = resources.length

    const preloadResource = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.ogg')) {
          const audio = new Audio()
          audio.oncanplaythrough = () => {
            loadedCount++
            setProgress((loadedCount / totalResources) * 100)
            resolve()
          }
          audio.onerror = () => {
            loadedCount++
            setProgress((loadedCount / totalResources) * 100)
            resolve()
          }
          audio.src = src
        } else {
          const img = new Image()
          img.onload = () => {
            loadedCount++
            setProgress((loadedCount / totalResources) * 100)
            resolve()
          }
          img.onerror = () => {
            loadedCount++
            setProgress((loadedCount / totalResources) * 100)
            resolve() 
          }
          img.src = src
        }
      })
    }

    Promise.all(resources.map(preloadResource))
      .then(() => {
        setIsLoaded(true)
      })
      .catch(() => {
        setIsLoaded(true) 
      })

  }, [resources])

  return { isLoaded, progress }
}
