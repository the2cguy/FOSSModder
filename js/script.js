var preferences
$(".selectbtn").click(function (e) { 
    e.preventDefault();
    electronAPI.selectfolder()
});
electronAPI.preferences((event, msg) => {
    preferences = msg
})