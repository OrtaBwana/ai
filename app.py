import web
import base64
import requests
import json
import os

urls = (
    '/', 'Index',
    '/upload', 'Upload',
    '/static/(.*)', 'Static' 
)

render = web.template.render('templates/')

class Index:
    def GET(self):
        return render.index()

class Upload:
    def POST(self):
        x = web.input(myfile={})
        filedir = 'uploads'  # Directorio donde se guardará la imagen
        if not os.path.exists(filedir):
            os.makedirs(filedir)

        # Obtener solo el nombre del archivo
        filename = os.path.basename(x.myfile.filename)
        filepath = os.path.join(filedir, filename)
        
        # Guardar el archivo subido
        with open(filepath, 'wb') as fout:
            fout.write(x.myfile.file.read())
        # Convertir la imagen a Base64
        imagen_base64 = convertir_imagen_a_base64(filepath)

        # Usar el prompt fijo
        prompt = "Contesta esto como un chat psicologo profesional especializado en combatir adicciones y da un posible analisis psicológico, tu nombre es Amigo y da una respuesta corta de 50 a 80 palabras y detallada en español:"

        # Generar respuesta usando la API
        respuesta = generar_respuesta(prompt, imagen_base64)

        return render.response(respuesta)

def convertir_imagen_a_base64(ruta_imagen):
    with open(ruta_imagen, "rb") as imagen:
        datos_imagen = imagen.read()
        datos_base64 = base64.b64encode(datos_imagen)
        cadena_base64 = datos_base64.decode('utf-8')
        return cadena_base64

def generar_respuesta(prompt, imagen_base64):
    url = "http://localhost:11434/api/generate"
    data = {
        "model": "llava",
        "prompt": prompt,
        "images": [imagen_base64],
        "stream": False,
        "system":"Eres un psicólogo especializado en adicciones. Analiza imágenes desde una perspectiva psicológica y ofrece feedback profesional y comprensivo, considerando el impacto emocional en los pacientes."
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        text = response.text
        json_response = json.loads(text)
        return json_response['response']
    else:
        return f"Error: {response.status_code}, Message: {response.text}"

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
