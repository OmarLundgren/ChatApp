using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Server.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> _users = new();
        private static readonly Dictionary<string, string> _roles = new();

        public async Task SendMessage (string message)
        {
            var user = _users.GetValueOrDefault(Context.ConnectionId, "Anonym");

            var timestamp = DateTime.Now.ToString("HH:mm");
            await Clients.All.SendAsync("ReceiveMessage", user, message, timestamp);

        }
        public async Task SendTeacherMessage (string message)
        {
            var user = _users.GetValueOrDefault(Context.ConnectionId, "Anonym");
            var role = _roles.GetValueOrDefault(Context.ConnectionId, "user");
            if (role == "teacher")
            {
                var timestamp = DateTime.Now.ToString("HH:mm");
                await Clients.All.SendAsync("ReceiveTeacherMessage", user, message, timestamp);
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("No access");
            }
            
        }
        public override async Task OnConnectedAsync()
        {

            var username = Context.GetHttpContext()?.Request.Query["username"].ToString();
            var role = Context.GetHttpContext()?.Request.Query["role"].ToString();

            _users[Context.ConnectionId] = username ?? "Anonym";
            _roles[Context.ConnectionId] = role ?? "user"; 

            await Clients.All.SendAsync("UserStatus", $"En ny användare (ID: {username ?? "Anonym"}) har anslutit.");

            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync( Exception? exp)
        {
            var user = _users.GetValueOrDefault(Context.ConnectionId, "Anonym");
            await Clients.All.SendAsync("UserStatus", $"Användare (ID: {user}) har lämnat chatten.");
            await base.OnDisconnectedAsync(exp  );
        }
    }
}
