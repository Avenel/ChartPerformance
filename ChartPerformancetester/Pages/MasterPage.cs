using System;
using Xamarin.Forms;

namespace ChartPerformancetester
{
	public class MasterPage : ContentPage
	{
		public MasterPage ()
		{
			var layout = new StackLayout { Spacing = 0, VerticalOptions = LayoutOptions.FillAndExpand };

			var label = new ContentView {
				Padding = new Thickness(10, 36, 0, 5),
				Content = new Xamarin.Forms.Label {
					TextColor = Color.FromHex("AAAAAA"),
					Text = "Hello World", 
				}
			};

			layout.Children.Add(label);
			Content = layout;
		}
	}
}

