using System;

using Xamarin.Forms;

namespace ChartPerformance.Pages
{
    public class NavPage : NavigationPage
    {
        public NavPage(Page rootPage) : base(rootPage)
        {
            BarBackgroundColor = Helpers.Color.Blue.ToFormsColor();
            BarTextColor = Helpers.Color.White.ToFormsColor();
        }
    }
}

