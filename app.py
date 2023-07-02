from flask import Flask, request, jsonify
from threading import Thread
from helpers import convert_video_to_audio, audio_transcriber, LLMSummarizer
import uuid

app = Flask(__name__)
conversion_thread = None
global_status = None

def start_conversion(video_url):
    global conversion_thread
    global global_status
    global_status = {'status': 'Conversion Started'}
    try:
        output_filename = f"output_{uuid.uuid4().hex}.wav"
        convert_video_to_audio(video_url, output_filename, 2)
        global_status = {'status': 'Audio has been Extracted from Video'}
        audio_transcriber(output_filename)
        global_status = {'status': 'The Audio has been Transcribed into Text using our Advanced AI'}
        output_text_file = output_filename.replace(".wav",".txt")
        summary = LLMSummarizer(video_url,output_text_file)
        global_status = {'status': 'The Video has been Summarized','message':summary}

    except Exception as e:
        print(f"Error processing the request: {str(e)}")
        global_status = {'error': f"Error processing the request: {str(e)}"}
    finally:
        conversion_thread = None

@app.route('/api', methods=['POST'])
def api():
    global conversion_thread
    # Get the video URL from the request
    data = request.get_json()
    video_url = data.get('video_url')
    # Process the request and generate a response
    if not video_url:
        return jsonify({'error': 'No video URL found in the request'}), 400

    if conversion_thread is not None and conversion_thread.is_alive():
        return jsonify({'message': 'Video Summarizing already in progress'})

    # Start the conversion process in a separate thread
    conversion_thread = Thread(target=start_conversion, args=(video_url,))
    conversion_thread.start()

    # Send initial response to the client
    response = jsonify({'message': 'Video conversion started'})
    response.status_code = 202  # Accepted
    response.headers['Location'] = '/api/status'
    return response

@app.route('/api/status', methods=['GET'])
def api_status():
    if conversion_thread is not None and conversion_thread.is_alive():
        status = global_status
    else:
        status = global_status
    return jsonify(status)

# Handle errors
@app.errorhandler(404)
def page_not_found(error):
    response = {'error': 'Page not found'}
    return jsonify(response), 404

@app.errorhandler(500)
def internal_server_error(error):
    response = {'error': 'Internal server error'}
    return jsonify(response), 500

if __name__ == '__main__':
    app.run(debug=True)
