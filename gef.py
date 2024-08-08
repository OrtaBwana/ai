import requests
import json

# URL de la API
url = "http://localhost:11434/api/generate"

# Función para generar una respuesta
def generar_respuesta(prompt):
    data = {
        "model": "llama2",
        "prompt": prompt,
        "system": "Responde como el presidente Andres Manuel Lopez Obrador",
        "stream": False
    }

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Verifica si la solicitud fue exitosa
        json_response = response.json()  # Analiza la respuesta JSON
        return json_response.get('response', 'No se encontró respuesta en el JSON')
    except requests.exceptions.RequestException as e:
        return f"Error en la solicitud: {e}"
    except json.JSONDecodeError:
        return "Error al decodificar la respuesta JSON"

# Función para manejar el chat
def chat():
    print("Inicia el chat. Escribe 'salir' para terminar.")
    while True:
        user_input = input("Tú: ")
        if user_input.lower() == 'salir':
            print("Chat terminado.")
            break
        respuesta = generar_respuesta(user_input)
        print(f"AMLO: {respuesta}")

# Punto de entrada principal
if __name__ == "__main__":
    chat()
