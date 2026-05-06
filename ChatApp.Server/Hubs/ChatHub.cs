using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Server.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage (string user, string message)
        {

            var timestamp = DateTime.Now.ToString("HH:mm:ss");
            await Clients.All.SendAsync("ReceiveMessage", user, message);

        }
        public override async Task OnConnectedAsync()
        {
            
            var connectionId = Context.ConnectionId;
            await Clients.All.SendAsync("UserStatus", $"En ny användare (ID: {connectionId}) har anslutit.");

            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync( Exception? exp)
        {
            var connectionId = Context.ConnectionId;
            await Clients.All.SendAsync("UserStatus", $"Användare (ID: {connectionId}) har lämnat chatten.");
            await base.OnDisconnectedAsync(exp  );
        }
    }
}
