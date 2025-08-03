using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Dev2ndBrain.Controllers
{
    public class ExecuteCSharpRequest
    {
        public string Code { get; set; }
        public List<string> Inputs { get; set; } = new List<string>();
    }

    public class ExecuteCSharpResponse
    {
        public string Output { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ExecuteController : ControllerBase
    {
        [HttpPost("csharp")]
        public async Task<IActionResult> ExecuteCSharp([FromBody] ExecuteCSharpRequest request)
        {
            var originalOutput = Console.Out;
            var originalInput = Console.In;

            try
            {
                using var outputWriter = new StringWriter();
                Console.SetOut(outputWriter);

                using var inputReader = new StringReader(string.Join(Environment.NewLine, request.Inputs));
                Console.SetIn(inputReader);

                var options = ScriptOptions.Default
                    .WithImports("System")
                    .WithEmitDebugInformation(true);

                var script = CSharpScript.Create(request.Code, options);

                var state = await script.RunAsync(
                    globals: null,
                    catchException: ex =>
                    {
                        outputWriter.WriteLine($"Error: {ex.Message}");
                        return true;    
                    },
                    cancellationToken: default
                );

                string result = outputWriter.ToString();

                if (state.ReturnValue != null && !string.IsNullOrWhiteSpace(state.ReturnValue.ToString()))
                {
                    if (!string.IsNullOrEmpty(result))
                    {
                        result += Environment.NewLine;
                    }
                    result += state.ReturnValue.ToString();
                }

                if (string.IsNullOrEmpty(result))
                {
                    result = "No output";
                }

                return Ok(new ExecuteCSharpResponse { Output = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ExecuteCSharpResponse { Output = $"Execution Error: {ex.Message}" });
            }
            finally
            {
                Console.SetOut(originalOutput);
                Console.SetIn(originalInput);
            }
        }
    }
}