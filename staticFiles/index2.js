// async function uploadDataToModel(data) {
//     try {
//       const response = await fetch('/upload', {
//         method: 'POST',
//         body: JSON.stringify(data),
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       if (response.ok) {
//         const predictions = await response.json();
//         // Handle the predictions received from the ML model
//         console.log(predictions);
//       } else {
//         console.error('Upload failed:', response.status);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }

function base64ToBlob(base64String, contentType) {
    const sliceSize = 1024;
    const byteCharacters = atob(base64String);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }

  
  
jQuery(document).ready( function () {
    var $ = jQuery;
    var myRecorder = {
        objects: {
            context: null,
            stream: null,
            recorder: null
        },
        init:  function () {
            if (null === myRecorder.objects.context) {
                myRecorder.objects.context = new (
                        window.AudioContext || window.webkitAudioContext
                        );
            }
        },
        start:  function () {
            var options = {audio: true, video: false};
            navigator.mediaDevices.getUserMedia(options).then(function (stream) {
                myRecorder.objects.stream = stream;
                myRecorder.objects.recorder = new Recorder(
                        myRecorder.objects.context.createMediaStreamSource(stream),
                        {numChannels: 1}
                );
                myRecorder.objects.recorder.record();
            }).catch(function (err) {});
        },
        stop: function (listObject) {
            if (null !== myRecorder.objects.stream) {
                myRecorder.objects.stream.getAudioTracks()[0].stop();
            }
            if (null !== myRecorder.objects.recorder) {
                myRecorder.objects.recorder.stop();

                // Validate object
                if (null !== listObject
                        && 'object' === typeof listObject
                        && listObject.length > 0) {
                    // Export the WAV file
                        myRecorder.objects.recorder.exportWAV(function (blob) {
                            var url = (window.URL || window.webkitURL).createObjectURL(blob);

                        // Prepare the playback
                        var audioObject = $('<audio controls></audio>')
                                .attr('src', url);

                        // Prepare the download link
                        // var downloadObject = $('S')
                        //         .attr('href', url)
                        //         .attr('download', new Date().toUTCString() + '.wav');

                        // Wrap everything in a row
                        var holderObject = $('<div class="row" style="position: relative; right: 28px; margin-bottom: 10px; align-self: flex-end;"></div>')
                                .append(audioObject)
                                // .append(downloadObject);


                        // Append to the list
                        listObject.append(holderObject);
                      // Call sendAudioData to send the Blob to the server
                        reply_url = sendAudioData(blob , listObject);
                    });
                }
            }
        }
    };



    //................................................................................................

    async function sendAudioData(blob , listObject) {
        const formData = new FormData();
        formData.append('audio', blob);
    
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch the audio data');
            }
        // Get the audio blob from the response
        const audioBlob = await response.blob();
        if (audioBlob) {
            // Create a Blob URL for the audio
            const audioUrl = URL.createObjectURL(audioBlob);

            // Prepare the playback
            const audioObject = $('<audio controls></audio>').attr('src', audioUrl);

            // Prepare the download link
            // const downloadObject = $('<a>&#9660;</a>')
            //     .attr('href', audioUrl)
            //     .attr('download', new Date().toUTCString() + '.wav');

            // Wrap everything in a row
            const holderObject = $('<div class="row" style="position: relative; left: 20px; margin-bottom: 10px; align-self: flex-start;"></div>')
                .append(audioObject)
                // .append(downloadObject);

            // Append to the list
            listObject.append(holderObject);
            return holderObject
        }

            
        } catch (error) {
            console.error('Error:', error);
            alert(error);
        }
        return null;
    }
    
      //................................................................................................

    // Prepare the recordings list
    var listObject = $('[data-role="recordings"]');

    // Prepare the record button
    $('[data-role="controls"] > button').click(function () {
        // Initialize the recorder
        myRecorder.init();

        // Get the button state 
        var buttonState = !!$(this).attr('data-recording');

        // Toggle
        if (!buttonState) {
            $(this).attr('data-recording', 'true');
            myRecorder.start();
        } else {
            $(this).attr('data-recording', '');
            myRecorder.stop(listObject);
        }



    });
});
